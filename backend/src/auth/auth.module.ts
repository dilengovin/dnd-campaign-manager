import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SESSION_LIFETIME_SECONDS } from './session.constants';
import { SessionService } from './session.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // Startup already refused to continue without this, so by the time
        // the module graph is built it is a real secret and not `undefined`.
        secret: config.getOrThrow<string>('SESSION_SECRET'),
        signOptions: { expiresIn: SESSION_LIFETIME_SECONDS },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionService],
})
export class AuthModule {}
