import { redirect } from '@tanstack/react-router';
import { createMiddleware, createStart } from '@tanstack/react-start';
import { getRequestHeaders, getRequestUrl } from '@tanstack/react-start/server';

import { auth } from '@/lib/auth';

const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next }) => {
    const rawHeaders = getRequestHeaders();
    const headers = new Headers(rawHeaders as HeadersInit);
    const url = getRequestUrl();

    if (url.pathname !== '/login') {
      return next();
    }

    const session = await auth.api.getSession({ headers });

    if (session?.user) {
      const redirectTo = url.searchParams.get('redirect') || '/dashboard';

      throw redirect({
        to: redirectTo,
      });
    }

    return next();
  },
);

export const startInstance = createStart(() => ({
  requestMiddleware: [authMiddleware],
}));
