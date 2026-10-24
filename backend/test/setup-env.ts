import { testDatabaseUrl } from './test-database';

// Runs in every worker before anything imports the Prisma client, so the real
// application booted by a test connects to the test database and nothing else.
process.env.DATABASE_URL = testDatabaseUrl();
