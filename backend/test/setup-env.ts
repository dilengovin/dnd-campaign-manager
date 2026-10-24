import { testDatabaseUrl } from './test-database';

// Runs in every worker before anything imports the Prisma client, so the real
// application booted by a test connects to the test database and nothing else.
process.env.DATABASE_URL = testDatabaseUrl();

// The suite supplies its own signing secret rather than borrowing a
// developer's: booting the application is startup, and startup now refuses an
// absent one. Nothing in this slice signs anything with it yet.
process.env.SESSION_SECRET ??= 'test-session-secret';
