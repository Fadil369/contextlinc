import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/auth';
import { chatRoutes } from './routes/chat';
import { fileRoutes } from './routes/files';
import { contextRoutes } from './routes/context';

export interface Env {
  CONTEXTLINC_STORAGE: R2Bucket;
  CONTEXTLINC_DB: D1Database;
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  VOYAGE_API_KEY: string;
  JWT_SECRET: string;
  CORS_ORIGINS: string;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', (c, next) => {
  const corsOrigins = c.env.CORS_ORIGINS?.split(',') || ['*'];
  return cors({
    origin: corsOrigins,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })(c, next);
});

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development',
    version: '1.0.0'
  });
});

// API Routes
app.route('/api/chat', chatRoutes);
app.route('/api/files', fileRoutes);
app.route('/api/context', contextRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.json({ 
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong'
  }, 500);
});

export default app;