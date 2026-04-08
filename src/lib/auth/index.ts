import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

import * as schema from '@/lib/db';
import { db } from '@/lib/db';

const isDev = process.env.NODE_ENV === 'development';
const baseURL = process.env.BETTER_AUTH_URL ?? process.env.LOCAL_BASE_URL;

export const auth = betterAuth({
  baseURL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    schema: {
      users: schema.users,
      sessions: schema.sessions,
      accounts: schema.accounts,
      verifications: schema.verifications,
    },
  }),

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day -> refresh session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  trustedOrigins: isDev ? [process.env.LOCAL_BASE_URL!] : [baseURL!],

  plugins: [tanstackStartCookies()],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
