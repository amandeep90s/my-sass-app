import { Elysia } from 'elysia';

import { auth } from '@/lib/auth';
import { db, purchases } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const api = new Elysia({ prefix: '/api' })
  .onRequest(({ request }) => {
    console.log(`[API] ${request.method} ${request.url}`);
  })
  .onError(({ code, error, path }) => {
    console.error(`[API] Error ${code} on ${path}:`, error);
  })
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  .get('/me', async ({ request, set }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    return { user: session.user };
  })
  .get('/payments/status', async ({ request, set }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    const purchase = await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, session.user.id))
      .limit(1);

    return {
      userId: session.user.id,
      purchase: purchase[0] ?? null,
    };
  });

export type Api = typeof api;
