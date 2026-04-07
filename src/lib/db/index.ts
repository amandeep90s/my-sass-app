import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import ws from 'ws';

import * as schema from './schema';

const isProduction = process.env.NODE_ENV === 'production';
const LOCAL_DB_HOST = 'localhost';

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// We need to use the WebSocket constructor for Neon
neonConfig.webSocketConstructor = ws;

if (!isProduction) {
  connectionString = `postgres://postgres:postgres@${LOCAL_DB_HOST}:5433/my_saas_app`;
  neonConfig.fetchEndpoint = (host) => {
    const [protocol, port] =
      host === LOCAL_DB_HOST ? ['http', 4444] : ['https', 443];
    return `${protocol}://${host}:${port}/sql`;
  };
  neonConfig.useSecureWebSocket = false;
  neonConfig.wsProxy = (host) =>
    host === LOCAL_DB_HOST ? `${host}:4444/v2` : `${host}/v2`;
}

const client = neon(connectionString);

export const db = drizzle({ client, schema });

export * from './schema';
