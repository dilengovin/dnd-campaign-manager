import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './create-test-app';

describe('Health with Postgres unreachable (e2e)', () => {
  const realDatabaseUrl = process.env.DATABASE_URL;
  let app: INestApplication;

  beforeAll(async () => {
    // Nothing is listening on port 1, so the health check's query cannot reach
    // a database however well the rest of the process is running.
    process.env.DATABASE_URL = 'postgresql://nobody:nobody@127.0.0.1:1/nowhere?schema=public';
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    process.env.DATABASE_URL = realDatabaseUrl;
  });

  it('fails rather than reporting health it cannot vouch for', async () => {
    const response = await request(app.getHttpServer()).get('/api/health').expect(503);

    // Nest's own error shape, not a bespoke one — the spec keeps the default
    // everywhere so no endpoint has to document an envelope of its own.
    expect(response.body).toEqual({
      statusCode: 503,
      error: 'Service Unavailable',
      message: 'Database unreachable',
    });
  });
});
