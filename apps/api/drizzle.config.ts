import type { Config } from 'drizzle-kit';

export default {
  schema:    './src/db/schema.ts',
  out:       './migrations',
  dialect:   'sqlite',
  driver:    'd1-http',
  dbCredentials: {
    // Used only for drizzle-kit studio/introspect against remote D1
    // Set these env vars when running: wrangler d1 export or drizzle-kit studio
    accountId:  process.env.CLOUDFLARE_ACCOUNT_ID ?? '',
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID ?? '',
    token:      process.env.CLOUDFLARE_D1_TOKEN ?? '',
  },
} satisfies Config;
