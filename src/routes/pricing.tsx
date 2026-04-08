import { Link, createFileRoute } from '@tanstack/react-router';
import { Check } from 'lucide-react';

import { useSession } from '@/lib/auth/client';
import { useCheckout } from '@/hooks/use-checkout';

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
});

const features = [
  'Full access to all features',
  'Priority support',
  'Unlimited projects',
  'Advanced analytics',
  'Custom integrations',
  'Lifetime updates',
];

function PricingPage() {
  const { data: session } = useSession();
  const checkout = useCheckout();

  const handlePurchase = () => {
    if (!session?.user) {
      window.location.href = '/login?redirect=/pricing';
      return;
    }
    checkout.mutate();
  };

  return (
    <main className="page-wrap px-4 py-12">
      <section className="rise-in mx-auto max-w-3xl text-center">
        <p className="island-kicker mb-3">Pricing</p>
        <h1 className="display-title mb-4 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          One plan. Everything included.
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-(--sea-ink-soft)">
          No tiers to compare. No feature gates. Pay once and get full access to
          everything, forever.
        </p>

        <div className="island-shell mx-auto max-w-md rounded-2xl p-8">
          <div className="mb-6">
            <span className="inline-block rounded-full bg-[rgba(79,184,178,0.14)] px-3 py-1 text-xs font-bold tracking-wider text-(--lagoon-deep) uppercase">
              Pro
            </span>
          </div>

          <div className="mb-6 flex items-baseline justify-center gap-1">
            <span className="display-title text-5xl font-bold text-(--sea-ink)">
              $49
            </span>
            <span className="text-sm text-(--sea-ink-soft)">
              one-time payment
            </span>
          </div>

          <ul className="mb-8 space-y-3 text-left">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm text-(--sea-ink)"
              >
                <Check className="h-4 w-4 shrink-0 text-(--lagoon)" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handlePurchase}
            disabled={checkout.isPending}
            className="w-full rounded-full bg-(--lagoon-deep) px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-(--lagoon) disabled:opacity-50"
          >
            {checkout.isPending
              ? 'Redirecting to checkout...'
              : 'Get Pro Access'}
          </button>

          {checkout.error && (
            <p className="mt-3 text-sm text-red-500">
              Something went wrong. Please try again.
            </p>
          )}

          {!session?.user && (
            <p className="mt-4 text-xs text-(--sea-ink-soft)">
              You'll need to{' '}
              <Link
                to="/login"
                search={{ redirect: '/pricing' }}
                className="font-semibold text-(--lagoon-deep)"
              >
                sign in
              </Link>{' '}
              first.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
