import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { SessionService } from './session.service';

/**
 * A request carries a User's id, put there by the guard that proved it.
 * Everything behind the guard reads this rather than re-verifying the cookie.
 */
export interface AuthenticatedRequest extends Request {
  userId: string;
}

/**
 * Refuses anyone without a Session. Opt-in per route rather than global: most
 * of this slice is registering and signing in, which are by definition reached
 * without one. From `campaigns-api` onwards it guards everything owner-scoped.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly session: SessionService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = this.session.userIdFrom(request);

    if (!userId) {
      throw new UnauthorizedException();
    }

    request.userId = userId;
    return true;
  }
}
