import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ApiClient } from './api-client';
import { createTestApp } from './create-test-app';

// A literal for the same reason the Session spec uses one: a rename is a
// change to what browsers already hold, and importing the constant would let
// one pass unnoticed.
const SESSION_COOKIE_NAME = 'session';

const CREDENTIALS = { email: 'tasha@example.com', password: 'a-long-enough-passphrase' };

describe('Signing out (e2e)', () => {
  let app: INestApplication;
  let client: ApiClient;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    client = await ApiClient.start(app);
  });

  afterAll(async () => {
    await app.close();
  });

  /** The raw `Set-Cookie` line the Session was written on, if there was one. */
  function sessionCookieHeader(headers: Record<string, unknown>): string | undefined {
    const cookies = headers['set-cookie'] as unknown as string[] | undefined;
    return cookies?.find((candidate) => candidate.startsWith(`${SESSION_COOKIE_NAME}=`));
  }

  it('ends a Session, and the next question about who I am is answered with nobody', async () => {
    await client.post('/api/auth/register').send(CREDENTIALS).expect(201);
    await client.get('/api/auth/me').expect(200);

    await client.post('/api/auth/logout').expect(204);

    // Not "the response succeeded" but "the cookie is gone": the server wrote
    // an empty Session over the one the browser held, expiring immediately.
    // This has to be a round-trip at all because the cookie is `httpOnly` and
    // no client can delete it itself — which is what the `frontend-on-api`
    // slice inherits.
    await client.get('/api/auth/me').expect(401);
  });

  // Asserted off the header rather than inferred from the 204, because a
  // handler that returned 204 and set no cookie at all would leave the browser
  // holding a working Session while telling the User they had signed out.
  it('writes a cleared Session cookie, not merely a successful response', async () => {
    await client.post('/api/auth/register').send(CREDENTIALS).expect(201);

    const response = await client.post('/api/auth/logout').expect(204);
    const cookie = sessionCookieHeader(response.headers);

    // Empty, and already past: either alone would be enough, and browsers are
    // handed both.
    expect(cookie).toMatch(/^session=;/);
    expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/i);

    // Still the attributes it was written with. A replacement that differed on
    // `Path` would be a second cookie beside the first rather than an
    // overwrite of it, and the Session would survive.
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
    expect(cookie).toMatch(/Secure/i);
    expect(cookie).toMatch(/Path=\//i);
  });

  it('succeeds for someone who was not signed in to begin with', async () => {
    // Signing out twice is not an error, and neither is signing out of
    // nothing: the client cannot see whether its cookie is still good, so
    // asking to end a Session that has already ended is the normal case.
    await client.post('/api/auth/logout').expect(204);
    await client.post('/api/auth/logout').expect(204);
  });

  it('is state-changing, so it is refused without the double-submit token', async () => {
    await request(app.getHttpServer()).post('/api/auth/logout').expect(403);
  });

  // Deliberately pinning a limitation rather than a capability. ADR-0003 makes
  // the Session a stateless JWT with no server-side revocation, so signing out
  // takes the cookie off this browser and does nothing to a copy of the token
  // taken beforehand — the seven-day expiry is the only thing that ever will.
  // If this test starts failing, something has added revocation, which
  // supersedes ADR-0003 rather than extending it and is a decision to make
  // there rather than here.
  it('does not invalidate a copy of the token taken before signing out', async () => {
    await client.post('/api/auth/register').send(CREDENTIALS).expect(201);
    const copyOfTheToken = client.cookie(SESSION_COOKIE_NAME)!;

    await client.post('/api/auth/logout').expect(204);
    await client.get('/api/auth/me').expect(401);

    client.setCookie(SESSION_COOKIE_NAME, copyOfTheToken);
    await client.get('/api/auth/me').expect(200);
  });
});
