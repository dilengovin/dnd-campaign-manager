import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '../src/csrf/csrf.constants';

/**
 * A client that behaves the way a browser does against this API: it keeps the
 * cookies it is handed, sends them back on every later request, and echoes the
 * double-submit token in the header the guard looks for.
 *
 * Supertest's own agent cannot stand in for this. Every cookie this service
 * sets is marked `Secure`, and the agent will not resend a `Secure` cookie over
 * `http://`, so its jar silently stays empty — where a real browser would not,
 * for the reason recorded on `SESSION_COOKIE_OPTIONS`.
 */
export class ApiClient {
  private readonly cookies = new Map<string, string>();

  private constructor(private readonly app: INestApplication) {}

  /**
   * Starts a client with a CSRF token in hand, the way the frontend will be
   * handed one by whichever call it makes first on boot.
   */
  static async start(app: INestApplication): Promise<ApiClient> {
    const client = new ApiClient(app);
    await client.get('/api/health').expect(200);

    if (!client.cookies.has(CSRF_COOKIE_NAME)) {
      throw new Error(`No ${CSRF_COOKIE_NAME} cookie was issued; the CSRF middleware is not running.`);
    }

    return client;
  }

  get(path: string): request.Test {
    return this.send('get', path);
  }

  post(path: string): request.Test {
    return this.send('post', path);
  }

  /** The current value of a cookie the client holds, if it holds one. */
  cookie(name: string): string | undefined {
    return this.cookies.get(name);
  }

  /** Replaces a cookie's value, standing in for a client that tampers with one. */
  setCookie(name: string, value: string): void {
    this.cookies.set(name, value);
  }

  private send(method: 'get' | 'post', path: string): request.Test {
    const test = request(this.app.getHttpServer())[method](path);

    if (this.cookies.size > 0) {
      test.set('Cookie', [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; '));
    }

    const token = this.cookies.get(CSRF_COOKIE_NAME);
    if (token) {
      test.set(CSRF_HEADER_NAME, token);
    }

    test.on('response', (response) => this.absorb(response.headers['set-cookie']));
    return test;
  }

  private absorb(setCookie: string[] | undefined): void {
    for (const cookie of setCookie ?? []) {
      const [pair] = cookie.split(';');
      const separator = pair.indexOf('=');
      this.cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
  }
}
