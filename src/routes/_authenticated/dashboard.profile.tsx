import { createFileRoute } from '@tanstack/react-router';
import { ProfileForm } from '@/components/profile-form';
import { User, Mail, Calendar } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/dashboard/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();

  return (
    <main className="page-wrap px-4 py-12">
      <div className="rise-in mx-auto max-w-2xl">
        <p className="island-kicker mb-2">Settings</p>
        <h1 className="display-title mb-8 text-3xl font-bold text-(--sea-ink)">
          Your Profile
        </h1>

        {/* Profile card */}
        <div className="island-shell mb-6 rounded-2xl p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || 'Profile'}
                className="h-16 w-16 rounded-full border-2 border-(--line)"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-(--line) bg-[rgba(79,184,178,0.14)]">
                <User className="h-8 w-8 text-(--lagoon-deep)" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-(--sea-ink)">
                {user.name || 'Unnamed User'}
              </h2>
              <div className="flex items-center gap-1.5 text-sm text-(--sea-ink-soft)">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-(--sea-ink-soft)">
            <Calendar className="h-3.5 w-3.5" />
            Joined{' '}
            {new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Update name form */}
        <div className="island-shell rounded-2xl p-6 sm:p-8">
          <h3 className="mb-4 text-lg font-bold text-(--sea-ink)">
            Update Display Name
          </h3>
          <ProfileForm currentName={user.name || ''} />
        </div>
      </div>
    </main>
  );
}
