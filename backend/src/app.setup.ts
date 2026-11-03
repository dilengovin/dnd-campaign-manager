import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

/**
 * Everything the running application configures on top of the module graph.
 * The tests boot the real application and call this too, so a test exercises
 * the same routes — prefix and all — that a browser would.
 */
export function configureApp(app: INestApplication): INestApplication {
  // The CSRF defence reads the token the client was issued, so cookies have
  // to be parsed before any middleware or guard runs.
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      // Properties no DTO declares are dropped rather than carried any
      // further, so nothing a caller invents can reach a database column.
      whitelist: true,
    }),
  );
  return app;
}
