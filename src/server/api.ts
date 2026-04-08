import { Elysia, t } from 'elysia';

import { auth } from '@/lib/auth';
import { db, purchases, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { purchasesRoute } from '@/server/routes/purchases';

export const api = new Elysia({ prefix: '/api' })
  // Mount Better Auth to handle /api/auth/* routes
  .mount(auth.handler)

  // Mount the purchases route to handle /api/purchases/* routes
  .use(purchasesRoute)

  // Log all incoming requests and errors for debugging purposes
  .onRequest(({ request }) => {
    console.log(`[API] ${request.method} ${request.url}`);
  })
  .onError(({ code, error, path }) => {
    console.error(`[API] Error ${code} on ${path}:`, error);
  })

  // Health check endpoint to verify the API is running
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  // Protected endpoint to get the current user's session and info
  .get('/me', async ({ request, set }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    return { user: session.user };
  })

  // Protected endpoint to update the current user's name, requires authentication
  .patch(
    '/me',
    async ({ request, body, set }) => {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }

      const [updatedUser] = await db
        .update(users)
        .set({
          name: body.name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id))
        .returning();

      return { user: updatedUser };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 100 }),
      }),
    },
  )

  // Endpoint to check the user's purchase status, requires authentication
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
