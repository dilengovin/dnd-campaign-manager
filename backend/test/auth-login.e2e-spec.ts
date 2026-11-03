import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ApiClient } from './api-client';
import { createTestApp } from './create-test-app';

const CREDENTIALS = { email: 'tasha@example.com', password: 'a-long-enough-passphrase' };

describe('Signing in (e2e)', () => {
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

  /** Registers the User, then forgets the Session that registering issued. */
  async function registerThenForgetTheSession(): Promise<string> {
    const registration = await client.post('/api/auth/register').send(CREDENTIALS).expect(201);

    // A returning User arrives with no Session at all; keeping the one
    // registration handed over would make signing in look like it worked
    // when it had done nothing.
    client.setCookie('session', '');

    return registration.body.id as string;
  }

  it('answers a returning User with who they are', async () => {
    const id = await registerThenForgetTheSession();

    const response = await client.post('/api/auth/login').send(CREDENTIALS).expect(200);

    expect(response.body).toEqual({ id, email: CREDENTIALS.email });
  });

  it('hands back a Session carrying the attributes ADR-0003 rests on', async () => {
    const id = await registerThenForgetTheSession();

    const response = await client.post('/api/auth/login').send(CREDENTIALS).expect(200);

    // The same Session ticket 05 established, not a second kind of cookie
    // issued down a parallel path: the attributes are asserted again here
    // because a login that set them differently would be the whole of
    // ADR-0003 lost on the route most people arrive through.
    const cookie = (response.headers['set-cookie'] as unknown as string[]).find((candidate) =>
      candidate.startsWith('session='),
    );

    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
    expect(cookie).toMatch(/Secure/i);
    expect(Number(/Max-Age=(\d+)/i.exec(cookie!)?.[1])).toBe(7 * 24 * 60 * 60);

    // And it is a Session that actually works, which is the point of it.
    const me = await client.get('/api/auth/me').expect(200);
    expect(me.body).toEqual({ id, email: CREDENTIALS.email });
  });

  it('refuses a wrong password', async () => {
    await registerThenForgetTheSession();

    await client
      .post('/api/auth/login')
      .send({ ...CREDENTIALS, password: 'not-the-right-passphrase' })
      .expect(401);
  });

  it('refuses an Email with no account behind it', async () => {
    await client
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'a-long-enough-passphrase' })
      .expect(401);
  });

  // The reason sign-in has to be written carefully at all. If these two
  // refusals differ in any way a caller can see, the sign-in screen becomes a
  // way for anyone to ask which Emails have accounts — one request at a time,
  // without ever guessing a password.
  it('refuses both the same way, so neither says whether the Email is registered', async () => {
    await registerThenForgetTheSession();

    const wrongPassword = await client
      .post('/api/auth/login')
      .send({ ...CREDENTIALS, password: 'not-the-right-passphrase' })
      .expect(401);

    const noSuchAccount = await client
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'a-long-enough-passphrase' })
      .expect(401);

    expect(noSuchAccount.status).toBe(wrongPassword.status);
    expect(noSuchAccount.body).toEqual(wrongPassword.body);

    // Headers too, and the Email appears in neither body: a message naming
    // the account, or a `Set-Cookie` on only one path, would tell the caller
    // just as much as a different status would.
    expect(headersWorthComparing(noSuchAccount.headers)).toEqual(
      headersWorthComparing(wrongPassword.headers),
    );
    expect(JSON.stringify(noSuchAccount.body)).not.toContain('nobody@example.com');
    expect(JSON.stringify(wrongPassword.body)).not.toContain(CREDENTIALS.email);
  });

  it('is state-changing, so it is refused without the double-submit token', async () => {
    await registerThenForgetTheSession();

    // Deliberately not through `ApiClient`, which echoes the token the way a
    // browser does. Signing in is mutating and is not exempt — ticket 03's
    // guard is global precisely so this cannot be forgotten here.
    await request(app.getHttpServer()).post('/api/auth/login').send(CREDENTIALS).expect(403);
  });

  it("refuses an Email that is not one, in the framework's own error shape", async () => {
    const response = await client
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'a-long-enough-passphrase' })
      .expect(400);

    // The same shape registration answers with: one envelope across the slice,
    // so a form renders field-level messages the same way on both screens.
    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: expect.arrayContaining([expect.stringMatching(/email/i)]),
    });
  });

  it('refuses a password longer than 128 characters rather than hashing it', async () => {
    // The ceiling is on this endpoint too, and for the same reason: argon2 is
    // not handed unbounded work by anyone who posts a megabyte.
    await client
      .post('/api/auth/login')
      .send({ email: CREDENTIALS.email, password: 'p'.repeat(129) })
      .expect(400);
  });

  // The same question asked of the clock rather than the response. Verifying a
  // password costs tens of milliseconds by design, so a path that skips the
  // verify because it found no account returns in a fraction of the time — and
  // that difference is readable from outside however identical the two bodies
  // are. The assertion is a loose band on the median of several attempts: the
  // gap it exists to catch is close to an order of magnitude, so it does not
  // need a tight bound, and a tight one on a shared machine would only flake.
  it('refuses both in the same time, so the clock does not say it either', async () => {
    await registerThenForgetTheSession();

    // Interleaved rather than one batch after the other. Measuring all of one
    // kind first lets anything that drifts over the run — a warming cache, a
    // machine getting busier — land entirely on one of the two and read as a
    // difference between them. Alternating puts that drift on both equally.
    // It also means a first attempt that is slow only because it was first
    // sits in the sample rather than being hidden behind four later ones.
    const { wrongPassword, noSuchAccount } = await timeAlternately(5, {
      wrongPassword: () =>
        client.post('/api/auth/login').send({ ...CREDENTIALS, password: 'wrong-passphrase-here' }),
      noSuchAccount: () =>
        client
          .post('/api/auth/login')
          .send({ email: 'nobody@example.com', password: 'a-long-enough-passphrase' }),
    });

    const ratio = median(noSuchAccount) / median(wrongPassword);
    expect(ratio).toBeGreaterThan(0.5);
    expect(ratio).toBeLessThan(2);
  });
});

/**
 * Times each kind of request `attempts` times, taking one of each in turn, and
 * answers with the durations in milliseconds under the same keys.
 */
async function timeAlternately<K extends string>(
  attempts: number,
  kinds: Record<K, () => Promise<unknown>>,
): Promise<Record<K, number[]>> {
  const durations = Object.fromEntries(
    Object.keys(kinds).map((kind) => [kind, [] as number[]]),
  ) as Record<K, number[]>;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    for (const [kind, send] of Object.entries(kinds) as [K, () => Promise<unknown>][]) {
      const started = performance.now();
      await send();
      durations[kind].push(performance.now() - started);
    }
  }

  return durations;
}

/** The median, not the mean: one scheduling hiccup should not move the answer. */
function median(durations: number[]): number {
  const sorted = [...durations].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Every header except the ones that differ between any two responses whatever
 * the endpoint — the date they were sent, and the length of a body already
 * compared directly.
 */
function headersWorthComparing(headers: Record<string, unknown>): Record<string, unknown> {
  const { date: _date, 'content-length': _length, ...rest } = headers;
  return rest;
}
