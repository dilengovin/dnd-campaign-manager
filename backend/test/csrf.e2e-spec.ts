import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './create-test-app';
import { CsrfFixtureController } from './fixtures/csrf-fixture.controller';

// Asserted here as literals rather than imported from the source: these are
// Angular's `HttpClient` defaults, and the frontend slice depends on them being
// exactly these. Importing the constants would let a rename pass unnoticed.
const COOKIE_NAME = 'XSRF-TOKEN';
const HEADER_NAME = 'X-XSRF-TOKEN';

describe('Double-submit CSRF protection (e2e)', () => {
  let app: INestApplication;

  /** The token a real client would have been handed on its first request. */
  async function issuedToken(): Promise<string> {
    const response = await request(app.getHttpServer()).get('/api/fixture').expect(200);
    const [cookie] = response.headers['set-cookie'] as unknown as string[];

    return cookie.slice(`${COOKIE_NAME}=`.length).split(';')[0];
  }

  beforeAll(async () => {
    app = await createTestApp({ controllers: [CsrfFixtureController] });
  });

  afterAll(async () => {
    await app.close();
  });

  it('issues a token cookie that script on the page can read', async () => {
    const response = await request(app.getHttpServer()).get('/api/fixture').expect(200);

    const [cookie] = response.headers['set-cookie'] as unknown as string[];

    expect(cookie).toMatch(new RegExp(`^${COOKIE_NAME}=.+`));
    // Deliberately unlike the Session cookie arriving in ticket 05: the client
    // has to read this one to echo it back, so `httpOnly` would defeat it.
    expect(cookie).not.toMatch(/HttpOnly/i);
    // Asserted for the same reason ADR-0003 has the Session cookie's own
    // attributes asserted: they are the protection, and a refactor that quietly
    // drops one should fail here rather than go unnoticed.
    expect(cookie).toMatch(/SameSite=Strict/i);
    expect(cookie).toMatch(/Secure/i);
  });

  it('leaves a token the client already holds alone', async () => {
    const token = await issuedToken();

    const response = await request(app.getHttpServer())
      .get('/api/fixture')
      .set('Cookie', `${COOKIE_NAME}=${token}`)
      .expect(200);

    // Reissuing on every request would race with a request already in flight
    // carrying the previous token, which would reject for no reason a User
    // could understand.
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('rejects a state-changing request carrying no token at all', async () => {
    await request(app.getHttpServer()).post('/api/fixture').expect(403);
  });

  it('rejects a state-changing request that holds a token but echoes none back', async () => {
    const token = await issuedToken();

    await request(app.getHttpServer())
      .post('/api/fixture')
      .set('Cookie', `${COOKIE_NAME}=${token}`)
      .expect(403);
  });

  it('rejects a state-changing request whose header does not match its cookie', async () => {
    await request(app.getHttpServer())
      .post('/api/fixture')
      .set('Cookie', `${COOKIE_NAME}=the-token-the-client-holds`)
      .set(HEADER_NAME, 'a-different-token')
      .expect(403);
  });

  it('allows a state-changing request whose header matches its cookie', async () => {
    const token = await issuedToken();

    const response = await request(app.getHttpServer())
      .post('/api/fixture')
      .set('Cookie', `${COOKIE_NAME}=${token}`)
      .set(HEADER_NAME, token)
      .expect(201);

    expect(response.body).toEqual({ written: true });
  });

  it('exempts safe requests, which need no token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/fixture')
      .set('Cookie', `${COOKIE_NAME}=`)
      .expect(200);

    expect(response.body).toEqual({ read: true });
  });
});
