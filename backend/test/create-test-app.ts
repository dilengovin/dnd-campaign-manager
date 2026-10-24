import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/**
 * Boots the real application — the same module graph and the same global
 * configuration `main.ts` uses — against the test database. Nothing is mocked,
 * least of all Prisma: a suite that mocks the database client tests the mock.
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = configureApp(moduleRef.createNestApplication());
  await app.init();
  return app;
}
