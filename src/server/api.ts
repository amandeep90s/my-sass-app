import { Elysia, t } from 'elysia';

import { auth } from '@/lib/auth';
import { db, purchases, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { purchasesRoute } from '@/server/routes/purchases';
import {
  constructWebhookEvent,
  createOneTimeCheckoutSession,
  retrieveCheckoutSession,
} from '@/lib/payments';

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
  })

  // Endpoint to create a Stripe checkout session for purchasing the Pro tier, requires authentication
  .post('/payments/checkout', async ({ set }) => {
    const priceId = process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      set.status = 500;
      return { error: 'Price not configured' };
    }

    const baseUrl = process.env.BETTER_AUTH_URL ?? process.env.DEV_BASE_URL;

    const checkoutSession = await createOneTimeCheckoutSession({
      priceId,
      successUrl: `${baseUrl}/dashboard?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing`,
      metadata: { tier: 'pro' },
    });

    return { url: checkoutSession.url };
  })

  // Endpoint to handle Stripe webhook events, such as successful payments
  .post('/payments/webhook', async ({ request, set }) => {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      set.status = 400;
      return { error: 'Missing Stripe signature' };
    }

    try {
      const event = await constructWebhookEvent(body, signature);
      console.log(`[Webhook] Received ${event.type}`);

      if (event.type === 'charge.refunded') {
        const charge = event.data.object as {
          id: string;
          payment_intent: string;
          amount: number;
          amount_refunded: number;
          currency: string;
        };

        // await inngest.send({
        //   name: 'stripe/charge.refunded',
        //   data: {
        //     chargeId: charge.id,
        //     paymentIntentId: charge.payment_intent,
        //     amountRefunded: charge.amount_refunded,
        //     originalAmount: charge.amount,
        //     currency: charge.currency,
        //   },
        // });
      }

      return { received: true };
    } catch (error) {
      console.error('[Webhook] Stripe verification failed:', error);
      set.status = 400;
      return { error: 'Webhook verification failed' };
    }
  })

  // Placeholder endpoint for claiming purchases, requires authentication
  .post(
    '/purchases/claim',
    async ({ body, request, set }) => {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }

      const { sessionId } = body;

      // Check if already claimed (idempotency)
      const existing = await db
        .select()
        .from(purchases)
        .where(eq(purchases.stripeCheckoutSessionId, sessionId))
        .limit(1);

      if (existing[0]) {
        return { success: true, alreadyClaimed: true, tier: existing[0].tier };
      }

      // Verify payment with Stripe
      const stripeSession = await retrieveCheckoutSession(sessionId);

      if (stripeSession.payment_status !== 'paid') {
        set.status = 400;
        return { error: 'Payment not completed' };
      }

      const tier = (stripeSession.metadata?.tier ?? 'pro') as 'pro';

      // Create purchase record
      await db.insert(purchases).values({
        userId: session.user.id,
        stripeCheckoutSessionId: sessionId,
        stripeCustomerId:
          typeof stripeSession.customer === 'string'
            ? stripeSession.customer
            : (stripeSession.customer?.id ?? null),
        stripePaymentIntentId:
          typeof stripeSession.payment_intent === 'string'
            ? stripeSession.payment_intent
            : (stripeSession.payment_intent?.id ?? null),
        tier,
        status: 'completed',
        amount: stripeSession.amount_total ?? 0,
        currency: stripeSession.currency ?? 'usd',
      });

      // Trigger background processing
      // await inngest.send({
      //   name: 'purchase/completed',
      //   data: {
      //     userId: session.user.id,
      //     tier,
      //     sessionId,
      //   },
      // });

      return { success: true, tier };
    },
    {
      body: t.Object({
        sessionId: t.String(),
      }),
    },
  );

export type Api = typeof api;
