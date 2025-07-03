import { MultiModalProcessor } from './processors/multiModalProcessor';
import { EmbeddingService } from './services/embeddingService';

export interface Env {
  CONTEXTLINC_STORAGE: R2Bucket;
  CONTEXTLINC_DB: D1Database;
  FILE_PROCESSING_QUEUE: Queue;
  OPENAI_API_KEY: string;
  VOYAGE_API_KEY: string;
  TIKA_SERVER_URL: string;
  ENVIRONMENT: string;
}

export interface FileProcessingMessage {
  fileId: string;
  userId: string;
  sessionId: string;
  r2Key: string;
  fileType: string;
  fileName: string;
  timestamp: string;
}

export default {
  async queue(batch: MessageBatch<FileProcessingMessage>, env: Env): Promise<void> {
    console.log(`Processing ${batch.messages.length} file(s)`);
    
    const processor = new MultiModalProcessor(env);
    const embeddingService = new EmbeddingService(env);

    for (const message of batch.messages) {
      try {
        await processFile(message.body, processor, embeddingService, env);
        message.ack();
      } catch (error) {
        console.error(`Failed to process file ${message.body.fileId}:`, error);
        message.retry();
      }
    }
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env.ENVIRONMENT
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/process' && request.method === 'POST') {
      try {
        const fileData: FileProcessingMessage = await request.json();
        
        const processor = new MultiModalProcessor(env);
        const embeddingService = new EmbeddingService(env);
        
        await processFile(fileData, processor, embeddingService, env);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: 'Processing failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function processFile(
  fileData: FileProcessingMessage,
  processor: MultiModalProcessor,
  embeddingService: EmbeddingService,
  env: Env
): Promise<void> {
  const { fileId, userId, sessionId, r2Key, fileType, fileName } = fileData;

  try {
    // Update status to processing
    await env.CONTEXTLINC_DB.prepare(`
      UPDATE files SET processing_status = 'processing' WHERE id = ?
    `).bind(fileId).run();

    // Get file from R2
    const fileObject = await env.CONTEXTLINC_STORAGE.get(r2Key);
    if (!fileObject) {
      throw new Error('File not found in storage');
    }

    // Process based on file type
    const processingResult = await processor.processFile(fileObject, fileType, fileName);

    // Generate embeddings
    const embeddings = await embeddingService.generateEmbeddings(
      processingResult.extractedText,
      processingResult.chunks
    );

    // Store results in database
    await env.CONTEXTLINC_DB.prepare(`
      UPDATE files SET 
        processing_status = 'completed',
        processed_at = ?,
        extracted_content = ?,
        embeddings_generated = TRUE
      WHERE id = ?
    `).bind(
      new Date().toISOString(),
      JSON.stringify(processingResult),
      fileId
    ).run();

    // Store embeddings
    for (let i = 0; i < embeddings.length; i++) {
      await env.CONTEXTLINC_DB.prepare(`
        INSERT INTO embeddings (
          id, user_id, content_id, content_type, embedding_vector, 
          model_used, chunk_index, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        userId,
        fileId,
        'file',
        JSON.stringify(embeddings[i].vector),
        embeddings[i].model,
        i,
        new Date().toISOString()
      ).run();
    }

    // Store in memory system for context
    await storeInMemory(env, userId, sessionId, {
      type: 'file_processed',
      fileId,
      fileName,
      summary: processingResult.summary,
      keyTopics: processingResult.keyTopics,
      extractedText: processingResult.extractedText.substring(0, 1000) // Store first 1000 chars
    });

    console.log(`Successfully processed file: ${fileName} (${fileId})`);

  } catch (error) {
    console.error(`File processing error for ${fileId}:`, error);
    
    // Update status to failed
    await env.CONTEXTLINC_DB.prepare(`
      UPDATE files SET 
        processing_status = 'failed',
        processed_at = ?
      WHERE id = ?
    `).bind(
      new Date().toISOString(),
      fileId
    ).run();

    throw error;
  }
}

async function storeInMemory(
  env: Env,
  userId: string,
  sessionId: string,
  content: any
): Promise<void> {
  const memoryId = crypto.randomUUID();
  const summary = `Processed file: ${content.fileName}`;
  
  await env.CONTEXTLINC_DB.prepare(`
    INSERT INTO memory (
      id, user_id, session_id, memory_type, content, summary,
      relevance_score, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    memoryId,
    userId,
    sessionId,
    'medium', // Medium-term memory for file processing
    JSON.stringify(content),
    summary,
    0.8, // High relevance for processed files
    new Date().toISOString()
  ).run();
}