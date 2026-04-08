import { treaty } from '@elysiajs/eden';

import type { Api } from '@/server/api';

// For client-side usage, connect to the same origin as the server
export const api = treaty<Api>(
  typeof window !== undefined
    ? window.location.origin
    : (process.env.BETTER_AUTH_URL ?? process.env.LOCAL_BASE_URL!),
);
