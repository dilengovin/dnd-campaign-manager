import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Loads `.env` into the environment so a plain `npm start` has a
    // DATABASE_URL to connect with. Validating that the required variables are
    // actually present comes next, as its own slice of work.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
