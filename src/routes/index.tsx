import { Link, createFileRoute } from '@tanstack/react-router';
import { Shield, Zap, CreditCard } from 'lucide-react';

import { useSession } from '@/lib/auth/client';

export const Route = createFileRoute('/')({ component: HomePage });

function HomePage() {
  const { data: session } = useSession();

  return (
    <main className="page-wrap px-4 pt-14 pb-8">
      {/* Hero */}
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -top-24 -left-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Your SaaS, Ready to Launch</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-(--sea-ink) sm:text-6xl">
          Start simple, ship quickly.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-(--sea-ink-soft) sm:text-lg">
          Authentication, payments, and background jobs — all wired up. Focus on
          what makes your product unique.
        </p>
        <div className="flex flex-wrap gap-3">
          {session?.user ? (
            <Link
              to="/dashboard"
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-(--lagoon-deep) no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-(--lagoon-deep) no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
            >
              Get Started
            </Link>
          )}
          <Link
            to="/pricing"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-(--sea-ink) no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        <div className="feature-card rounded-2xl border border-(--line) p-6 transition">
          <Shield className="mb-4 h-8 w-8 text-(--lagoon)" />
          <h3 className="mb-2 text-lg font-bold text-(--sea-ink)">
            Secure Auth
          </h3>
          <p className="text-sm leading-relaxed text-(--sea-ink-soft)">
            GitHub OAuth powered by Better Auth. Session management, protected
            routes, and cookie-based auth out of the box.
          </p>
        </div>

        <div className="feature-card rounded-2xl border border-(--line) p-6 transition">
          <CreditCard className="mb-4 h-8 w-8 text-(--lagoon)" />
          <h3 className="mb-2 text-lg font-bold text-(--sea-ink)">
            Stripe Payments
          </h3>
          <p className="text-sm leading-relaxed text-(--sea-ink-soft)">
            One-time checkout, webhook handling, and purchase tracking. Accept
            payments from day one.
          </p>
        </div>

        <div className="feature-card rounded-2xl border border-(--line) p-6 transition">
          <Zap className="mb-4 h-8 w-8 text-(--lagoon)" />
          <h3 className="mb-2 text-lg font-bold text-(--sea-ink)">
            Background Jobs
          </h3>
          <p className="text-sm leading-relaxed text-(--sea-ink-soft)">
            Inngest-powered async workflows for emails, notifications, and
            post-purchase processing.
          </p>
        </div>
      </section>
    </main>
  );
}
