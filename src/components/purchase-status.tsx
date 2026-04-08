import { Link } from '@tanstack/react-router';
import { Crown, ShoppingBag } from 'lucide-react';

import { usePurchaseStatus } from '@/hooks/use-purchase-status';

export function PurchaseStatus() {
  const { data: purchase, isLoading, error } = usePurchaseStatus();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-1/2 rounded bg-(--line)" />
        <div className="h-3 w-1/3 rounded bg-(--line)" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">Failed to load purchase status.</p>
    );
  }

  if (!purchase || 'error' in purchase) {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-(--sea-ink-soft)" />
          <p className="font-semibold text-(--sea-ink)">Free Plan</p>
        </div>
        <p className="mb-4 text-sm text-(--sea-ink-soft)">
          Upgrade to Pro to unlock all features.
        </p>
        <Link
          to="/pricing"
          className="inline-block rounded-full bg-(--lagoon-deep) px-4 py-2 text-sm font-bold text-white no-underline transition hover:-translate-y-0.5 hover:bg-(--lagoon)"
        >
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Crown className="h-5 w-5 text-amber-500" />
        <p className="font-semibold text-(--sea-ink)">
          {purchase.tier
            ? purchase.tier.charAt(0).toUpperCase() + purchase.tier.slice(1)
            : 'Pro'}{' '}
          Plan
        </p>
      </div>
      <p className="text-sm text-(--sea-ink-soft)">
        Status:{' '}
        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-200">
          {purchase.status}
        </span>
      </p>
      <p className="mt-1 text-xs text-(--sea-ink-soft)">
        Purchased{' '}
        {purchase.purchasedAt
          ? new Date(purchase.purchasedAt).toLocaleDateString()
          : 'recently'}
      </p>
    </div>
  );
}
