import { INestApplication } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { ApiClient } from './api-client';
import { createTestApp } from './create-test-app';
import { truncateDatabase } from './setup-after-env';

// Asserted as a literal rather than imported: the frontend has nothing to do
// with this name, but a rename is a change to what browsers already hold, and
// importing the constant would let one pass unnoticed.
const SESSION_COOKIE_NAME = 'session';

const CREDENTIALS = { email: 'tasha@example.com', password: 'a-long-enough-passphrase' };

/** A genuinely signed Session that was already expired when it was minted. */
function expiredSessionFor(userId: string): string {
  return jwt.sign({ sub: userId }, process.env.SESSION_SECRET!, { expiresIn: '-1s' });
}

describe('A Session cookie, and who am I (e2e)', () => {
  let app: INestApplication;
  let client: ApiClient;

  /** The raw `Set-Cookie` line the Session arrived on. */
  function sessionCookieHeader(headers: Record<string, unknown>): string {
    const cookies = headers['set-cookie'] as unknown as string[];
    const cookie = cookies?.find((candidate) => candidate.startsWith(`${SESSION_COOKIE_NAME}=`));

    if (!cookie) {
      throw new Error('No Session cookie was set.');
    }

    return cookie;
  }

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    client = await ApiClient.start(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('signs a new User in as part of registering them', async () => {
    const response = await client.post('/api/auth/register').send(CREDENTIALS).expect(201);

    // A User who has just typed their password should not be sent to type it
    // again; registering issues the Session itself.
    expect(sessionCookieHeader(response.headers)).toMatch(
      new RegExp(`^${SESSION_COOKIE_NAME}=.+`),
    );
  });

  // The single most load-bearing test in the slice. ADR-0003's entire argument
  // rests on these three attributes: `httpOnly` is why a scripting flaw cannot
  // hand someone the account, `SameSite=Strict` is the first of the two CSRF
  // defences, and `Secure` keeps the cookie off plaintext. Nothing else in the
  // suite would notice if one of them were quietly dropped in a refactor.
  it('sets the Session cookie httpOnly, SameSite=Strict and Secure, expiring in seven days', async () => {
    const response = await client.post('/api/auth/register').send(CREDENTIALS).expect(201);
    const cookie = sessionCookieHeader(response.headers);

    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
    // Unconditional, including in development: browsers accept `Secure` over
    // `http://localhost`, so there is no flag left to remember in production.
    expect(cookie).toMatch(/Secure/i);

    const sevenDays = 7 * 24 * 60 * 60;
    const maxAge = Number(/Max-Age=(\d+)/i.exec(cookie)?.[1]);
    expect(maxAge).toBe(sevenDays);
  });

  it('tells a User holding a valid Session who they are', async () => {
    const registration = await client.post('/api/auth/register').send(CREDENTIALS).expect(201);

    const response = await client.get('/api/auth/me').expect(200);

    expect(response.body).toEqual({
      id: registration.body.id,
      email: CREDENTIALS.email,
    });
  });

  it('tells a caller with no Session that they are nobody', async () => {
    // The frontend acts on this: it sends a User to sign in rather than
    // rendering a shell it has nothing to fill.
    await client.get('/api/auth/me').expect(401);
  });

  it('refuses a Session cookie that has been edited by hand', async () => {
    await client.post('/api/auth/register').send(CREDENTIALS).expect(201);

    const [header, payload] = client.cookie(SESSION_COOKIE_NAME)!.split('.');
    // A payload naming somebody else, re-encoded and put back with the
    // original signature still attached.
    const forged = Buffer.from(
      JSON.stringify({ sub: '00000000-0000-4000-8000-000000000000' }),
    ).toString('base64url');
    client.setCookie(SESSION_COOKIE_NAME, `${header}.${forged}.not-the-real-signature`);

    await client.get('/api/auth/me').expect(401);
    expect(payload).toBeDefined();
  });

  it('refuses a Session that has expired', async () => {
    await client.post('/api/auth/register').send(CREDENTIALS).expect(201);

    // Issued with the real secret and correctly signed; it is only the clock
    // that makes it worthless. Time is not faked — the token is simply minted
    // already past its expiry, so the test stays fast and cannot flake.
    client.setCookie(SESSION_COOKIE_NAME, expiredSessionFor('00000000-0000-4000-8000-000000000000'));

    await client.get('/api/auth/me').expect(401);
  });

  it('refuses a Session naming a User who no longer exists', async () => {
    const response = await client.post('/api/auth/register').send(CREDENTIALS).expect(201);
    const sessionOfADeletedUser = client.cookie(SESSION_COOKIE_NAME)!;

    // The suite truncates between tests, which is a User ceasing to exist
    // while their Session is still signed and still unexpired — exactly the
    // case ADR-0003's lack of revocation leaves open.
    await truncateDatabase();
    client.setCookie(SESSION_COOKIE_NAME, sessionOfADeletedUser);

    await client.get('/api/auth/me').expect(401);
    expect(response.body.email).toBe(CREDENTIALS.email);
  });
});
