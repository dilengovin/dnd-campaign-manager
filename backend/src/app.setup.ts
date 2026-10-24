import { INestApplication } from '@nestjs/common';

/**
 * Everything the running application configures on top of the module graph.
 * The tests boot the real application and call this too, so a test exercises
 * the same routes — prefix and all — that a browser would.
 */
export function configureApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix('api');
  return app;
}
