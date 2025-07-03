import { Hono } from 'hono';
import { authMiddleware, User } from '../middleware/auth';
import { Env } from '../index';
import { ContextEngine } from '../services/contextEngine';

const app = new Hono<{ Bindings: Env }>();

// Apply auth middleware
app.use('*', authMiddleware);

// Get current context state
app.get('/state', async (c) => {
  try {
    const user = c.get('user') as User;
    const contextEngine = new ContextEngine(c.env, user);
    
    const contextState = await contextEngine.getContextState();
    
    return c.json({
      layers: contextState.layers,
      memory: contextState.memory,
      files: contextState.files,
      lastUpdate: contextState.lastUpdate,
      stats: contextState.stats
    });

  } catch (error) {
    console.error('Context state error:', error);
    return c.json({ error: 'Failed to get context state' }, 500);
  }
});

// Get specific layer information
app.get('/layers/:layerId', async (c) => {
  try {
    const user = c.get('user') as User;
    const layerId = parseInt(c.req.param('layerId'));
    
    if (layerId < 1 || layerId > 11) {
      return c.json({ error: 'Invalid layer ID (1-11)' }, 400);
    }

    const contextEngine = new ContextEngine(c.env, user);
    const layerData = await contextEngine.getLayerData(layerId);
    
    return c.json(layerData);

  } catch (error) {
    console.error('Layer data error:', error);
    return c.json({ error: 'Failed to get layer data' }, 500);
  }
});

// Update layer configuration
app.put('/layers/:layerId', async (c) => {
  try {
    const user = c.get('user') as User;
    const layerId = parseInt(c.req.param('layerId'));
    const updates = await c.req.json();
    
    if (layerId < 1 || layerId > 11) {
      return c.json({ error: 'Invalid layer ID (1-11)' }, 400);
    }

    const contextEngine = new ContextEngine(c.env, user);
    await contextEngine.updateLayerConfig(layerId, updates);
    
    return c.json({ success: true });

  } catch (error) {
    console.error('Layer update error:', error);
    return c.json({ error: 'Failed to update layer' }, 500);
  }
});

// Get memory system status
app.get('/memory', async (c) => {
  try {
    const user = c.get('user') as User;
    const contextEngine = new ContextEngine(c.env, user);
    
    const memoryStatus = await contextEngine.getMemoryStatus();
    
    return c.json({
      shortTerm: memoryStatus.shortTerm,
      mediumTerm: memoryStatus.mediumTerm,
      longTerm: memoryStatus.longTerm,
      totalItems: memoryStatus.totalItems,
      lastUpdate: memoryStatus.lastUpdate
    });

  } catch (error) {
    console.error('Memory status error:', error);
    return c.json({ error: 'Failed to get memory status' }, 500);
  }
});

// Search memory
app.post('/memory/search', async (c) => {
  try {
    const user = c.get('user') as User;
    const { query, memoryType = 'all', limit = 10 } = await c.req.json();
    
    if (!query) {
      return c.json({ error: 'Query required' }, 400);
    }

    const contextEngine = new ContextEngine(c.env, user);
    const results = await contextEngine.searchMemory(query, memoryType, limit);
    
    return c.json({
      results,
      query,
      memoryType,
      total: results.length
    });

  } catch (error) {
    console.error('Memory search error:', error);
    return c.json({ error: 'Failed to search memory' }, 500);
  }
});

// Get context analytics
app.get('/analytics', async (c) => {
  try {
    const user = c.get('user') as User;
    const timeframe = c.req.query('timeframe') || '7d'; // 1d, 7d, 30d
    
    const contextEngine = new ContextEngine(c.env, user);
    const analytics = await contextEngine.getAnalytics(timeframe);
    
    return c.json({
      layerUsage: analytics.layerUsage,
      memoryGrowth: analytics.memoryGrowth,
      contextRelevance: analytics.contextRelevance,
      processingTimes: analytics.processingTimes,
      tokenUsage: analytics.tokenUsage,
      timeframe
    });

  } catch (error) {
    console.error('Context analytics error:', error);
    return c.json({ error: 'Failed to get analytics' }, 500);
  }
});

// Optimize context
app.post('/optimize', async (c) => {
  try {
    const user = c.get('user') as User;
    const { targetSize, preserveLayers = [] } = await c.req.json();
    
    const contextEngine = new ContextEngine(c.env, user);
    const optimizationResult = await contextEngine.optimizeContext(targetSize, preserveLayers);
    
    return c.json({
      success: true,
      originalSize: optimizationResult.originalSize,
      optimizedSize: optimizationResult.optimizedSize,
      compressionRatio: optimizationResult.compressionRatio,
      layersAffected: optimizationResult.layersAffected,
      preservedContent: optimizationResult.preservedContent
    });

  } catch (error) {
    console.error('Context optimization error:', error);
    return c.json({ error: 'Failed to optimize context' }, 500);
  }
});

// Reset context (clear all layers)
app.post('/reset', async (c) => {
  try {
    const user = c.get('user') as User;
    const { preserveMemory = false } = await c.req.json();
    
    const contextEngine = new ContextEngine(c.env, user);
    await contextEngine.resetContext(preserveMemory);
    
    return c.json({ 
      success: true,
      memoryPreserved: preserveMemory 
    });

  } catch (error) {
    console.error('Context reset error:', error);
    return c.json({ error: 'Failed to reset context' }, 500);
  }
});

export { app as contextRoutes };