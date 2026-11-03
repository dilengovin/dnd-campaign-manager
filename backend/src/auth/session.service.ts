import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { CookieOptions, Request, Response } from 'express';
import { SESSION_COOKIE_NAME, SESSION_LIFETIME_SECONDS } from './session.constants';

/**
 * What a Session token carries: the User's id and nothing else. A JWT's
 * payload is readable by anyone holding the token, so nothing sensitive goes
 * in it — not the Email, and certainly nothing about the password.
 */
interface SessionPayload {
  sub: string;
}

/**
 * The attributes ADR-0003 is built on, in one place so no endpoint can set a
 * Session cookie with a different set of them.
 */
const SESSION_COOKIE_OPTIONS: CookieOptions = {
  // No script can read this cookie, which is why a scripting flaw on the page
  // cannot hand someone the account. It is also why the frontend has to ask
  // the server who it is rather than looking locally.
  httpOnly: true,
  // Never attached to a request another site makes. The first of the two CSRF
  // defences; the double-submit token from ticket 03 is the second.
  sameSite: 'strict',
  // Unconditional, including in development: browsers accept `Secure` over
  // `http://localhost`, so this costs nothing here and removes a flag that
  // could otherwise be forgotten on the way to production.
  secure: true,
  path: '/',
  maxAge: SESSION_LIFETIME_SECONDS * 1000,
};

@Injectable()
export class SessionService {
  constructor(private readonly jwt: JwtService) {}

  /** Issues a Session to the browser making this request. */
  issue(response: Response, userId: string): void {
    const payload: SessionPayload = { sub: userId };
    response.cookie(SESSION_COOKIE_NAME, this.jwt.sign(payload), SESSION_COOKIE_OPTIONS);
  }

  /**
   * The User a request's Session belongs to, or `undefined` when it carries
   * no Session the signature and expiry both vouch for. One undifferentiated
   * answer on purpose: a forged cookie, a tampered one and an expired one are
   * all simply nobody.
   */
  userIdFrom(request: Request): string | undefined {
    const token = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;

    if (!token) {
      return undefined;
    }

    try {
      return this.jwt.verify<SessionPayload>(token).sub;
    } catch {
      return undefined;
    }
  }
}
