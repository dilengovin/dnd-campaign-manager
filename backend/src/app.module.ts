import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ENV_FILE_PATH, validateEnvironment } from './config/environment';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Loads `.env` into the environment so a plain `npm start` has a
    // DATABASE_URL to connect with, and validates it on the way through so the
    // config this module serves is never a partial one.
    //
    // The fail-fast itself lives elsewhere. Nest swallows a rejection from the
    // async `forRoot`, so a failure raised here would not stop the process:
    // `main.ts` calls the same validator before the application exists, and
    // that is what actually refuses to start. See `loadEnvironment`.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV_FILE_PATH,
      validate: validateEnvironment,
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
