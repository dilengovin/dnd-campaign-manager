import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { CSRF_COOKIE_NAME } from './csrf.constants';

/**
 * Hands every client a token to echo back.
 *
 * The cookie is deliberately readable by script — the whole mechanism is that
 * the client reads it and repeats it in a header, which only same-origin code
 * can do. That is the opposite of the Session cookie, which is `httpOnly`
 * precisely so script can never see it.
 */
@Injectable()
export class CsrfTokenMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    // An existing token is left alone. Reissuing on every request would race
    // with a request already in flight carrying the previous one.
    if (!request.cookies?.[CSRF_COOKIE_NAME]) {
      response.cookie(CSRF_COOKIE_NAME, randomBytes(32).toString('base64url'), {
        httpOnly: false,
        sameSite: 'strict',
        secure: true,
        path: '/',
      });
    }

    next();
  }
}
