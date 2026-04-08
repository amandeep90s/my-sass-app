import { useUpdateProfile } from '@/hooks/use-update-profile';
import { useState } from 'react';
import { Check } from 'lucide-react';

export function ProfileForm({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const updateProfile = useUpdateProfile();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name.trim()) {
      updateProfile.mutate({ name: name.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="name"
        className="mb-1.5 block text-sm font-semibold text-[var(--sea-ink)]"
      >
        Display Name
      </label>
      <input
        type="text"
        id="name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        className="block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] transition outline-none focus:border-[var(--lagoon)] focus:ring-2 focus:ring-[rgba(79,184,178,0.2)]"
      />

      <div className="mt-4 flex items-center gap-3">
        <button
          className="rounded-full bg-[var(--lagoon-deep)] px-5 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[var(--lagoon)] disabled:opacity-50"
          disabled={updateProfile.isPending || !name.trim()}
          type="submit"
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </button>

        {updateProfile.isSuccess && (
          <span className="flex items-center gap-1 text-sm font-medium text-green-600">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>

      {updateProfile.error && (
        <p className="mt-2 text-sm text-red-500">
          Failed to update profile. Please try again.
        </p>
      )}
    </form>
  );
}
