import { useUpdateProfile } from '@/hooks/use-update-profile';
import { useState } from 'react';

export function ProfileForm({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const updateProfile = useUpdateProfile();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    updateProfile.mutate({ name });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name" className="block text-sm font-medium">
        Display Name
      </label>
      <input
        type="text"
        id="name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-1 block w-full rounded-md border px-3 py-2"
      />

      <button
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white"
        disabled={updateProfile.isPending}
        type="submit"
      >
        {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
      </button>

      {updateProfile.error && (
        <p className="mt-2 text-sm text-red-600">
          Failed to update profile. Please try again.
        </p>
      )}
    </form>
  );
}
