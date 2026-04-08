import { Link, createFileRoute } from '@tanstack/react-router';
import { Crown, Settings, ShoppingBag, Zap } from 'lucide-react';
import { z } from 'zod';
import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { PurchaseStatus } from '@/components/purchase-status';
import { api } from '@/lib/treaty';

const searchSchema = z.object({
  purchase: z.string().optional(),
  session_id: z.string().optional(),
});

export const Route = createFileRoute('/_authenticated/dashboard/')({
  validateSearch: searchSchema,
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const { purchase, session_id } = Route.useSearch();
  const queryClient = useQueryClient();

  const claimPurchase = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await api.api.purchases.claim.post({
        sessionId,
      });
      if (error) throw new Error('Failed to claim purchase');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-status'] });
    },
  });

  useEffect(() => {
    if (purchase === 'success' && session_id) {
      claimPurchase.mutate(session_id);
    }
  }, [purchase, session_id]);

  return (
    <main className="page-wrap px-4 py-12">
      <div className="rise-in mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="island-kicker mb-2">Dashboard</p>
          <h1 className="display-title text-3xl font-bold text-(--sea-ink) sm:text-4xl">
            Welcome back, {user.name || 'there'}!
          </h1>
        </div>

        {/* Success banner */}
        {purchase === 'success' && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              <p className="font-semibold text-green-800 dark:text-green-200">
                {claimPurchase.isPending
                  ? 'Activating your purchase...'
                  : 'Purchase successful! Your Pro access is now active.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Plan status */}
          <div className="island-shell rounded-2xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-(--lagoon)" />
              <h2 className="text-lg font-bold text-(--sea-ink)">Your Plan</h2>
            </div>
            <PurchaseStatus />
          </div>

          {/* Quick actions */}
          <div className="island-shell rounded-2xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-(--lagoon)" />
              <h2 className="text-lg font-bold text-(--sea-ink)">
                Quick Actions
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/dashboard/profile"
                className="feature-card flex items-center gap-3 rounded-xl border border-(--line) p-4 no-underline"
              >
                <Settings className="h-5 w-5 text-(--lagoon-deep)" />
                <div>
                  <p className="font-semibold text-(--sea-ink)">
                    Profile Settings
                  </p>
                  <p className="text-xs text-(--sea-ink-soft)">
                    Update your name and preferences
                  </p>
                </div>
              </Link>
              <Link
                to="/pricing"
                className="feature-card flex items-center gap-3 rounded-xl border border-(--line) p-4 no-underline"
              >
                <ShoppingBag className="h-5 w-5 text-(--lagoon-deep)" />
                <div>
                  <p className="font-semibold text-(--sea-ink)">View Plans</p>
                  <p className="text-xs text-(--sea-ink-soft)">
                    Upgrade or manage your plan
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
