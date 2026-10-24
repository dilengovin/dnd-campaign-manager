import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { testDatabaseUrl } from './test-database';

// Brings the test database up to the committed migrations once per run, so a
// fresh checkout's first `npm test` is not a schema error.
export default function globalSetup(): void {
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: testDatabaseUrl() },
    stdio: 'inherit',
  });
}
