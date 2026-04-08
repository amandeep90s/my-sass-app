import { eq } from 'drizzle-orm';

import { inngest } from '@/lib/jobs/client';
import { db, purchases, users } from '@/lib/db';

export const handlePurchaseCompleted = inngest.createFunction(
  {
    id: 'purchase-completed',
    triggers: [{ event: 'purchase/completed' }],
  },
  async ({ event, step }) => {
    const { userId, tier, sessionId } = event.data as {
      userId: string;
      tier: string;
      sessionId: string;
    };

    // Step 1: Look up the user and purchase details in the database
    const { user } = await step.run('lookup-user-and-purchase', async () => {
      const userResult = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const foundUser = userResult[0];

      if (!foundUser) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const purchaseResult = await db
        .select({
          amount: purchases.amount,
          currency: purchases.currency,
        })
        .from(purchases)
        .where(eq(purchases.stripeCheckoutSessionId, sessionId))
        .limit(1);

      return {
        user: foundUser,
        purchase: purchaseResult[0] ?? {
          amount: 0,
          currency: 'usd',
        },
      };
    });

    // Step 2: Send purchase confirmation email
    await step.run('send-purchase-confirmation', async () => {
      // Send email using your email service provider (e.g., SendGrid, Postmark, etc.)
      console.log(`Sending purchase confirmation to ${user.email}`);
    });

    // Step 3: Send admin notification
    await step.run('send-admin-notification', async () => {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) return;

      console.log(`Notifying admin about purchase from ${user.email}`);

      // await sendEmail({
      //   to: adminEmail,
      //   subject: `New sale: ${user.email}`,
      //   template: AdminNotificationEmail,
      // });
    });

    // Step 4: Update purchase record in the database
    await step.run('update-purchase-record', async () => {
      await db
        .update(purchases)
        .set({ updatedAt: new Date() })
        .where(eq(purchases.stripeCheckoutSessionId, sessionId));
    });

    return { success: true, userId, tier };
  },
);

export const handleRefund = inngest.createFunction(
  {
    id: 'refund-processed',
    triggers: [{ event: 'stripe/charge.refunded' }],
  },
  async ({ event, step }) => {
    const { paymentIntentId, amountRefunded, originalAmount } = event.data as {
      chargeId: string;
      paymentIntentId: string;
      amountRefunded: number;
      originalAmount: number;
      currency: string;
    };

    const isFullRefund = amountRefunded >= originalAmount;

    // Step 1: Find the purchase and user
    const { user, purchase } = await step.run('lookup-purchase', async () => {
      const purchaseResult = await db
        .select()
        .from(purchases)
        .where(eq(purchases.stripePaymentIntentId, paymentIntentId))
        .limit(1);

      if (!purchaseResult[0]) {
        return { user: null, purchase: null };
      }

      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, purchaseResult[0].userId))
        .limit(1);

      return {
        user: userResult[0] ?? null,
        purchase: purchaseResult[0],
      };
    });

    if (!purchase || !user) {
      return { success: false, reason: 'no_matching_purchase' };
    }

    // Step 2: Update purchase status
    await step.run('update-purchase-status', async () => {
      await db
        .update(purchases)
        .set({
          status: isFullRefund ? 'refunded' : 'partially_refunded',
          updatedAt: new Date(),
        })
        .where(eq(purchases.id, purchase.id));
    });

    // Step 3: Send customer notification
    await step.run('notify-customer', async () => {
      console.log(
        `Sending ${isFullRefund ? 'full' : 'partial'} refund notification to ${user.email}`,
      );
      // await sendEmail({ ... });
    });

    return { success: true, isFullRefund };
  },
);

export const stripeFunctions = [handlePurchaseCompleted, handleRefund];
