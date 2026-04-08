import { createFileRoute } from '@tanstack/react-router';

import { api } from '@/lib/treaty';

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: async () => {
    const { data } = await api.api.payments.status.get();

    return { purchase: data?.purchase ?? null };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { purchase } = Route.useLoaderData();

  return (
    <div>
      <h1>Dashboard</h1>
      {purchase ? <p>Your plan: {purchase.tier}</p> : <p>No active plan.</p>}
    </div>
  );
}
