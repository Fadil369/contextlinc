import { Context, Next } from 'hono';
import { Env } from '../index';

export interface User {
  id: string;
  email?: string;
  name?: string;
  sessionId: string;
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authorization = c.req.header('Authorization');
  
  // For now, create anonymous sessions
  // In production, implement proper JWT validation
  const sessionId = c.req.header('X-Session-ID') || generateSessionId();
  
  const user: User = {
    id: `anon_${sessionId}`,
    sessionId,
    name: 'Anonymous User'
  };
  
  c.set('user', user);
  await next();
}

export function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const user = c.get('user') as User;
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  return next();
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}