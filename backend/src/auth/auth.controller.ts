import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService, UserIdentity } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { CurrentUserId } from './current-user-id.decorator';
import { SessionGuard } from './session.guard';
import { SessionService } from './session.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly session: SessionService,
  ) {}

  @Post('register')
  async register(
    @Body() body: RegisterDto,
    // `passthrough` so Nest still serialises the return value and still applies
    // the 201; the response object is here only to set the cookie on.
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserIdentity> {
    const user = await this.auth.register(body.email, body.password);

    // Registering signs you in. A User who has just typed their password is
    // not sent back to type it again.
    this.session.issue(response, user.id);

    return user;
  }

  /**
   * The only way the frontend can know whether it is signed in: the Session
   * cookie is `httpOnly`, so script cannot look (ADR-0003). Called on boot and
   * cached from there.
   */
  @Get('me')
  @UseGuards(SessionGuard)
  me(@CurrentUserId() userId: string): Promise<UserIdentity> {
    return this.auth.identify(userId);
  }
}
