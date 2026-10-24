import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { loadEnvironment, MissingConfigurationError } from './config/environment';

async function bootstrap(): Promise<void> {
  // Before anything else: a half-configured process must never reach the point
  // of serving a request.
  loadEnvironment();

  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap().catch((error: unknown) => {
  // The configuration case gets its one actionable line, naming what is
  // missing; anything else is a real crash and keeps its stack trace.
  console.error(error instanceof MissingConfigurationError ? error.message : error);
  process.exit(1);
});
