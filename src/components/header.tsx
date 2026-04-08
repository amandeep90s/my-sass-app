import { Link, useRouter } from '@tanstack/react-router';
import { LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';

import { signOut, useSession } from '@/lib/auth/client';
import ThemeToggle from './ThemeToggle';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: '/' });
  };

  const navLinks = [
    { to: '/' as const, label: 'Home' },
    { to: '/about' as const, label: 'About' },
    { to: '/pricing' as const, label: 'Pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-(--line) bg-(--header-bg) backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link
          to="/"
          className="display-title text-lg font-bold text-(--sea-ink) no-underline"
        >
          MySaaS
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="nav-link text-sm font-semibold"
              activeProps={{
                className: 'nav-link is-active text-sm font-semibold',
              }}
              activeOptions={{ exact: true }}
            >
              {link.label}
            </Link>
          ))}
          {session?.user && (
            <Link
              to="/dashboard"
              className="nav-link text-sm font-semibold"
              activeProps={{
                className: 'nav-link is-active text-sm font-semibold',
              }}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard/profile"
                className="flex items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm font-semibold text-(--sea-ink) no-underline transition hover:-translate-y-0.5"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-5 w-5 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
                {session.user.name || 'Profile'}
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm font-semibold text-(--sea-ink) transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2 text-sm font-semibold text-(--lagoon-deep) no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-(--sea-ink) md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-(--line) bg-(--surface-strong) px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="nav-link text-sm font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {session?.user && (
              <>
                <Link
                  to="/dashboard"
                  className="nav-link text-sm font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="nav-link text-sm font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </Link>
              </>
            )}
            <hr className="border-(--line)" />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {session?.user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm font-semibold text-(--sea-ink) transition hover:border-red-300 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2 text-sm font-semibold text-(--lagoon-deep) no-underline"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
