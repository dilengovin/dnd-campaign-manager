import { INestApplication } from '@nestjs/common';
import { ApiClient } from './api-client';
import { createTestApp } from './create-test-app';

describe('Registering a User (e2e)', () => {
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

  it('creates a User and answers with who they are', async () => {
    const response = await client
      .post('/api/auth/register')
      .send({ email: 'tasha@example.com', password: 'a-long-enough-passphrase' })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      email: 'tasha@example.com',
    });
  });

  it('refuses an Email that already has an account, plainly enough to act on', async () => {
    await client
      .post('/api/auth/register')
      .send({ email: 'tasha@example.com', password: 'a-long-enough-passphrase' })
      .expect(201);

    const response = await client
      .post('/api/auth/register')
      .send({ email: 'tasha@example.com', password: 'a-different-passphrase' })
      .expect(409);

    // The person is being told to sign in instead, so the message has to say
    // the account exists rather than report a constraint violation.
    expect(response.body.message).toMatch(/already/i);
  });

  it('refuses an Email that is not one, in the framework\'s own error shape', async () => {
    const response = await client
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'a-long-enough-passphrase' })
      .expect(400);

    // Nest's default shape, kept everywhere: a bespoke envelope would have to
    // be documented and then honoured by every endpoint forever.
    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: expect.arrayContaining([expect.stringMatching(/email/i)]),
    });
  });

  it('refuses a password shorter than eight characters', async () => {
    const response = await client
      .post('/api/auth/register')
      .send({ email: 'tasha@example.com', password: 'sevench' })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([expect.stringMatching(/password/i)]),
    );
  });

  it('refuses a password longer than 128 characters', async () => {
    // The ceiling exists so argon2 cannot be handed unbounded work on the
    // service's behalf, not because a long passphrase is a bad one.
    await client
      .post('/api/auth/register')
      .send({ email: 'tasha@example.com', password: 'p'.repeat(129) })
      .expect(400);
  });

  it('accepts a long memorable passphrase with no symbols, digits or capitals', async () => {
    // No composition rules, deliberately: they push people toward short
    // awkward passwords, and the length floor does the real work.
    await client
      .post('/api/auth/register')
      .send({ email: 'tasha@example.com', password: 'correct horse battery staple' })
      .expect(201);
  });

  it('strips properties the request had no business sending', async () => {
    const chosenId = '00000000-0000-4000-8000-000000000000';

    const response = await client
      .post('/api/auth/register')
      .send({
        email: 'tasha@example.com',
        password: 'a-long-enough-passphrase',
        id: chosenId,
      })
      .expect(201);

    // Observable from outside precisely because the invented id did not
    // become the User's: it was dropped, not persisted.
    expect(response.body.id).not.toBe(chosenId);
  });

  it('never puts a password hash in a response body', async () => {
    const response = await client
      .post('/api/auth/register')
      .send({ email: 'tasha@example.com', password: 'a-long-enough-passphrase' })
      .expect(201);

    expect(Object.keys(response.body)).toEqual(['id', 'email']);
    expect(JSON.stringify(response.body)).not.toContain('argon2');

    // Every endpoint in the slice, not just the one that does the hashing:
    // the guarantee is that a hash is nowhere in any response body at all.
    const me = await client.get('/api/auth/me').expect(200);

    expect(Object.keys(me.body)).toEqual(['id', 'email']);
    expect(JSON.stringify(me.body)).not.toContain('argon2');
  });
});
