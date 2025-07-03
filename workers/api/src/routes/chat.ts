import { Hono } from 'hono';
import { authMiddleware, User } from '../middleware/auth';
import { Env } from '../index';
import { ContextEngine } from '../services/contextEngine';
import { AIService } from '../services/aiService';

const app = new Hono<{ Bindings: Env }>();

// Apply auth middleware
app.use('*', authMiddleware);

// Send message endpoint
app.post('/message', async (c) => {
  try {
    const user = c.get('user') as User;
    const { message, files = [], contextOptions = {} } = await c.req.json();

    if (!message && files.length === 0) {
      return c.json({ error: 'Message or files required' }, 400);
    }

    // Initialize services
    const contextEngine = new ContextEngine(c.env, user);
    const aiService = new AIService(c.env);

    // Store user message
    const messageId = crypto.randomUUID();
    await storeMessage(c.env.CONTEXTLINC_DB, {
      id: messageId,
      userId: user.id,
      sessionId: user.sessionId,
      type: 'user',
      content: message,
      files,
      timestamp: new Date().toISOString()
    });

    // Build context window using the 11-layer architecture
    const contextWindow = await contextEngine.buildContextWindow(message, files);

    // Generate AI response
    const aiResponse = await aiService.generateResponse(contextWindow, {
      model: contextOptions.model || 'gpt-4',
      maxTokens: contextOptions.maxTokens || 2048,
      temperature: contextOptions.temperature || 0.7
    });

    // Store AI response
    const responseId = crypto.randomUUID();
    await storeMessage(c.env.CONTEXTLINC_DB, {
      id: responseId,
      userId: user.id,
      sessionId: user.sessionId,
      type: 'assistant',
      content: aiResponse.content,
      metadata: {
        model: aiResponse.model,
        tokens: aiResponse.usage,
        confidence: aiResponse.confidence,
        processingTime: aiResponse.processingTime,
        contextLayers: contextWindow.layers
      },
      timestamp: new Date().toISOString()
    });

    // Update context state
    await contextEngine.updateContextState(aiResponse);

    return c.json({
      messageId: responseId,
      content: aiResponse.content,
      metadata: {
        model: aiResponse.model,
        processingTime: aiResponse.processingTime,
        confidence: aiResponse.confidence,
        contextRelevance: contextWindow.relevanceScore,
        tokensUsed: aiResponse.usage?.total_tokens
      },
      context: {
        activeLayers: contextWindow.activeLayers,
        memoryUpdated: true,
        filesProcessed: files.length
      }
    });

  } catch (error) {
    console.error('Chat message error:', error);
    return c.json({ 
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get conversation history
app.get('/history', async (c) => {
  try {
    const user = c.get('user') as User;
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const results = await c.env.CONTEXTLINC_DB.prepare(`
      SELECT id, type, content, metadata, timestamp
      FROM messages 
      WHERE user_id = ? AND session_id = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).bind(user.id, user.sessionId, limit, offset).all();

    const messages = results.results.map((row: any) => ({
      id: row.id,
      type: row.type,
      content: row.content,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      timestamp: row.timestamp
    }));

    return c.json({
      messages: messages.reverse(), // Return in chronological order
      hasMore: messages.length === limit
    });

  } catch (error) {
    console.error('Chat history error:', error);
    return c.json({ error: 'Failed to get chat history' }, 500);
  }
});

// Clear conversation
app.delete('/clear', async (c) => {
  try {
    const user = c.get('user') as User;

    await c.env.CONTEXTLINC_DB.prepare(`
      DELETE FROM messages 
      WHERE user_id = ? AND session_id = ?
    `).bind(user.id, user.sessionId).run();

    // Clear context state
    const contextEngine = new ContextEngine(c.env, user);
    await contextEngine.clearContext();

    return c.json({ success: true });

  } catch (error) {
    console.error('Clear chat error:', error);
    return c.json({ error: 'Failed to clear conversation' }, 500);
  }
});

// Get conversation stats
app.get('/stats', async (c) => {
  try {
    const user = c.get('user') as User;

    const stats = await c.env.CONTEXTLINC_DB.prepare(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN type = 'user' THEN 1 END) as user_messages,
        COUNT(CASE WHEN type = 'assistant' THEN 1 END) as assistant_messages,
        MIN(timestamp) as first_message,
        MAX(timestamp) as last_message
      FROM messages 
      WHERE user_id = ? AND session_id = ?
    `).bind(user.id, user.sessionId).first();

    const fileStats = await c.env.CONTEXTLINC_DB.prepare(`
      SELECT 
        COUNT(*) as total_files,
        COUNT(CASE WHEN processing_status = 'completed' THEN 1 END) as processed_files,
        SUM(file_size) as total_size
      FROM files 
      WHERE user_id = ? AND session_id = ?
    `).bind(user.id, user.sessionId).first();

    return c.json({
      conversation: stats,
      files: fileStats
    });

  } catch (error) {
    console.error('Chat stats error:', error);
    return c.json({ error: 'Failed to get stats' }, 500);
  }
});

// Helper function to store messages
async function storeMessage(db: D1Database, message: any) {
  await db.prepare(`
    INSERT INTO messages (
      id, user_id, session_id, type, content, files, metadata, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    message.id,
    message.userId,
    message.sessionId,
    message.type,
    message.content,
    message.files ? JSON.stringify(message.files) : null,
    message.metadata ? JSON.stringify(message.metadata) : null,
    message.timestamp
  ).run();
}

export { app as chatRoutes };