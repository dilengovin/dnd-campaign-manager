import { PrismaClient } from '@prisma/client';

// One client for the whole worker, used only to clear state. Tests themselves
// go through HTTP; this is the harness, not a seam under test.
const prisma = new PrismaClient();

/**
 * Empties every application table. Tests therefore pass in any order and pass
 * twice in a row, because no test can see what an earlier one left behind.
 */
export async function truncateDatabase(): Promise<void> {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma_%'
  `;

  if (tables.length === 0) {
    return;
  }

  const quoted = tables.map(({ tablename }) => `"public"."${tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
}

afterEach(truncateDatabase);

afterAll(async () => {
  await prisma.$disconnect();
});
