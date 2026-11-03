import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './csrf.constants';

/**
 * Methods that do not change state. They are exempt because the double-submit
 * token protects against a request being *made* on a User's behalf from
 * another site, and a read made that way reveals nothing: `SameSite=Strict`
 * already keeps the Session cookie off it, so it is not the User's read.
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (SAFE_METHODS.has(request.method)) {
      return true;
    }

    const cookieToken = request.cookies?.[CSRF_COOKIE_NAME] as string | undefined;
    const headerToken = request.header(CSRF_HEADER_NAME);

    if (!cookieToken || !headerToken || !matches(headerToken, cookieToken)) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}

/**
 * Compares the two tokens in time that does not depend on how far they agree,
 * so that a caller cannot learn the token one character at a time by measuring
 * how long the rejection took.
 */
function matches(headerToken: string, cookieToken: string): boolean {
  const header = Buffer.from(headerToken);
  const cookie = Buffer.from(cookieToken);

  // `timingSafeEqual` throws on a length mismatch, which would be a leak of its
  // own; differing lengths are simply not a match.
  return header.length === cookie.length && timingSafeEqual(header, cookie);
}
