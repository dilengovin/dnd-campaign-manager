import { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

interface TestAppOptions {
  /**
   * Controllers the testing module registers on top of the real application's
   * own. Used where behaviour is cross-cutting and has no endpoint of its own
   * yet — the CSRF guard, which lands before anything it protects does.
   */
  controllers?: Type<unknown>[];
}

/**
 * Boots the real application — the same module graph and the same global
 * configuration `main.ts` uses — against the test database. Nothing is mocked,
 * least of all Prisma: a suite that mocks the database client tests the mock.
 */
export async function createTestApp(options: TestAppOptions = {}): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    controllers: options.controllers ?? [],
  }).compile();

  const app = configureApp(moduleRef.createNestApplication());
  await app.init();
  return app;
}
