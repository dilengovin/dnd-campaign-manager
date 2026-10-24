import { config as loadEnv } from 'dotenv';
import { join } from 'node:path';

/**
 * The suite truncates every table between tests, so pointing it at the
 * application's database would quietly delete a developer's own data. The
 * separate URL is required, and it is required to be a different one.
 */
export function testDatabaseUrl(): string {
  loadEnv({ path: join(__dirname, '..', '.env') });

  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Copy backend/.env.example to backend/.env — the test suite needs a database of its own.',
    );
  }

  if (testUrl === process.env.DATABASE_URL) {
    throw new Error(
      'TEST_DATABASE_URL is the same as DATABASE_URL. The suite truncates every table between tests and must never run against the application database.',
    );
  }

  return testUrl;
}
