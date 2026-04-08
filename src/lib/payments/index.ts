import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        'Stripe secret key is not defined in environment variables.',
      );
    }
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

// Lazy-initialized proxy so imports don't crash without env vars
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return Reflect.get(getStripe(), prop);
  },
});

export async function createOneTimeCheckoutSession(params: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
  customerEmail?: string;
  couponId?: string;
}) {
  // Create a checkout session for a one-time purchase
  const client = getStripe();

  const session = await client.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    ...(params.customerEmail && { customer_email: params.customerEmail }),
    ...(params.couponId
      ? { discounts: [{ coupon: params.couponId }] }
      : { allow_promotion_codes: true }),
  });

  return session;
}

export async function retrieveCheckoutSession(sessionId: string) {
  const client = getStripe();
  return client.checkout.sessions.retrieve(sessionId);
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error(
      'Stripe webhook secret is not defined in environment variables.',
    );
  }

  const client = getStripe();
  return client.webhooks.constructEvent(payload, signature, webhookSecret);
}
