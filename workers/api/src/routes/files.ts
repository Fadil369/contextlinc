import { Hono } from 'hono';
import { authMiddleware, User } from '../middleware/auth';
import { Env } from '../index';

const app = new Hono<{ Bindings: Env }>();

// Apply auth middleware
app.use('*', authMiddleware);

// Upload file endpoint
app.post('/upload', async (c) => {
  try {
    const user = c.get('user') as User;
    const formData = await c.req.formData();
    
    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      return c.json({ error: 'No files provided' }, 400);
    }

    const uploadResults = [];

    for (const file of files) {
      // Validate file
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        uploadResults.push({
          filename: file.name,
          error: 'File too large (max 50MB)'
        });
        continue;
      }

      const fileId = generateFileId();
      const key = `${user.sessionId}/${fileId}/${file.name}`;
      
      try {
        // Upload to R2
        await c.env.CONTEXTLINC_STORAGE.put(key, file.stream(), {
          httpMetadata: {
            contentType: file.type,
          },
          customMetadata: {
            userId: user.id,
            sessionId: user.sessionId,
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            fileSize: file.size.toString(),
          }
        });

        // Store metadata in D1
        await c.env.CONTEXTLINC_DB.prepare(`
          INSERT INTO files (
            id, user_id, session_id, filename, file_type, file_size, 
            r2_key, upload_timestamp, processing_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          fileId,
          user.id,
          user.sessionId,
          file.name,
          file.type,
          file.size,
          key,
          new Date().toISOString(),
          'pending'
        ).run();

        // Trigger file processing
        await scheduleFileProcessing(c, fileId, key, file.type);

        uploadResults.push({
          fileId,
          filename: file.name,
          size: file.size,
          type: file.type,
          status: 'uploaded',
          processingStatus: 'pending'
        });

      } catch (error) {
        console.error('Upload error:', error);
        uploadResults.push({
          filename: file.name,
          error: 'Upload failed'
        });
      }
    }

    return c.json({
      success: true,
      results: uploadResults
    });

  } catch (error) {
    console.error('Files upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Get file status
app.get('/:fileId/status', async (c) => {
  try {
    const user = c.get('user') as User;
    const fileId = c.req.param('fileId');

    const result = await c.env.CONTEXTLINC_DB.prepare(`
      SELECT * FROM files 
      WHERE id = ? AND user_id = ?
    `).bind(fileId, user.id).first();

    if (!result) {
      return c.json({ error: 'File not found' }, 404);
    }

    return c.json({
      fileId: result.id,
      filename: result.filename,
      processingStatus: result.processing_status,
      uploadTimestamp: result.upload_timestamp,
      processedAt: result.processed_at,
      extractedContent: result.extracted_content ? JSON.parse(result.extracted_content) : null,
      embeddings: result.embeddings_generated
    });

  } catch (error) {
    console.error('File status error:', error);
    return c.json({ error: 'Failed to get file status' }, 500);
  }
});

// List user files
app.get('/list', async (c) => {
  try {
    const user = c.get('user') as User;

    const results = await c.env.CONTEXTLINC_DB.prepare(`
      SELECT id, filename, file_type, file_size, upload_timestamp, processing_status
      FROM files 
      WHERE user_id = ? 
      ORDER BY upload_timestamp DESC
      LIMIT 50
    `).bind(user.id).all();

    return c.json({
      files: results.results
    });

  } catch (error) {
    console.error('File list error:', error);
    return c.json({ error: 'Failed to list files' }, 500);
  }
});

// Download file
app.get('/:fileId/download', async (c) => {
  try {
    const user = c.get('user') as User;
    const fileId = c.req.param('fileId');

    const fileRecord = await c.env.CONTEXTLINC_DB.prepare(`
      SELECT * FROM files 
      WHERE id = ? AND user_id = ?
    `).bind(fileId, user.id).first();

    if (!fileRecord) {
      return c.json({ error: 'File not found' }, 404);
    }

    const object = await c.env.CONTEXTLINC_STORAGE.get(fileRecord.r2_key);
    if (!object) {
      return c.json({ error: 'File not found in storage' }, 404);
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileRecord.filename}"`,
        'Content-Length': object.size.toString(),
      }
    });

  } catch (error) {
    console.error('File download error:', error);
    return c.json({ error: 'Download failed' }, 500);
  }
});

// Helper functions
function generateFileId(): string {
  return crypto.randomUUID();
}

async function scheduleFileProcessing(c: any, fileId: string, r2Key: string, fileType: string) {
  // In a real implementation, this would trigger a separate worker
  // For now, we'll just mark it as scheduled
  console.log(`Scheduled processing for file ${fileId} (${fileType})`);
  
  // You could dispatch to a queue or call another worker here
  // await c.env.FILE_PROCESSING_QUEUE.send({
  //   fileId,
  //   r2Key,
  //   fileType,
  //   timestamp: new Date().toISOString()
  // });
}

export { app as fileRoutes };