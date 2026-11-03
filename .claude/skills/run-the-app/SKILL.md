---
name: run-the-app
description: Run the DnD Campaign Manager frontend or backend, or drive the app in a real browser to check a change on screen. Use when asked to run, start, serve, or screenshot the app, to bring up Postgres, or to confirm routing or a click works in the real app rather than in a unit test.
---

# Run the app

Nothing runs from the repo root: there is no `package.json` there. Frontend
commands run from `frontend/`, backend commands from `backend/`, and Postgres
is a system service rather than anything this repo starts.

## Serve it

```bash
cd frontend
npm start            # http://localhost:4200
```

The dev server is zoneless Angular 21 with hot reload. First build on a cold
`.angular/cache` takes up to a minute; later rebuilds are seconds.

The backend needs Postgres up and a `.env` present, and lives on its own port:

```bash
pg_isready                       # expect: /tmp:5432 - accepting connections
brew services start postgresql@17   # only if it is not already running

cd backend
npm run start:dev      # http://localhost:3000, every route under /api
```

Postgres runs natively here, via Homebrew, hosting both `dndcm` and
`dndcm_test`. The repo also ships `docker-compose.yml` for the same two
databases, but this checkout does not use it — `docker compose up -d` would
bind the same port and collide. Prefer `pg_isready` over either as the check.

The service refuses to start half-configured: a missing `DATABASE_URL` or
`SESSION_SECRET` exits at startup naming the variable, rather than running with
a signing secret of `undefined`. If it dies on boot, read the one line it
printed before reaching for anything else — `cp .env.example .env` and
`openssl rand -base64 48` for the secret is usually the whole fix.

The backend is a plain JSON API, so `curl` is the right tool for it — the
"do not reach for curl" rule below is about the client-rendered frontend.
`curl localhost:3000/api/health` is the quickest proof the service is up and
genuinely reaching Postgres.

## Check a change on screen

Do not reach for `curl`. The app is client-rendered, so a request to any route
returns the `index.html` shell, never the screen. Drive a real browser instead:

```bash
cd frontend
npm run test:e2e     # headless, all routing checks
npm run test:e2e:ui  # Playwright's UI mode, for watching a run step by step
```

Playwright starts the dev server itself and stops it afterwards. If one is
already listening on 4200 it reuses that one, so `npm start` in another terminal
is fine and makes the run faster.

One-off exploration of a single screen, without writing a spec:

```bash
cd frontend
npx playwright codegen http://localhost:4200/campaigns   # needs a server running
```

## Which suite answers which question

| Question | Suite | Command |
| --- | --- | --- |
| Does the Campaign service behave? | Seam A, Vitest | `npm test` |
| Does a component render the right thing? | Seam B, Vitest + TestBed | `npm test` |
| Does a route resolve, a redirect land, a link mark itself active, a click arrive? | e2e, Playwright | `npm run test:e2e` |
| Does an API endpoint behave, over HTTP, against a real Postgres? | backend, Jest + Supertest | `cd backend && npm test` |
| Does the service refuse to start without its configuration? | no suite — by hand, see below | `node dist/main` |

`npm test` in `frontend/` is the unit suite alone and stays that way — it is the
fast one and gets run constantly. `npm test` in `backend/` boots the real Nest
application against the `dndcm_test` database, never the application's own, and
truncates between tests; nothing is mocked there, Prisma least of all. It needs
Postgres running and a `backend/.env`, for the same reason serving it does.

This table is where the line sits, and the other files point here rather than
restating it. The e2e harness covers the router and nothing else: a route
resolving to the screen it claims, a redirect landing, a link marking itself
current, a click arriving. Anything a TestBed test or a service test can reach
belongs in the unit suite, where it costs a fraction as much to run. Resist
re-asserting rendering or Campaign behaviour in the browser.

The e2e specs are not covered by `npm test`, so typecheck them separately:

```bash
cd frontend
npm run typecheck:e2e
```

## Startup is the one thing no suite reaches

If the process exits for want of a secret it never gets far enough to serve a
request, so Supertest structurally cannot observe it. The unit tests on
`validateEnvironment` in `backend/src/config/environment.spec.ts` stand in for
it; the real behaviour is checked by hand:

```bash
cd backend
npm run build
mv .env .env.off; node dist/main; echo "exit=$?"; mv .env.off .env
```

That prints the missing variables and `exit=1` without ever listening. The
success case needs no special check — `npm run start:dev` booting at all is it.
Restoring `.env` is part of the same line on purpose: leave it moved and the
next `npm test` fails for a reason that looks nothing like the cause.

Resist adding a suite for this. The spec calls it Seam B and caps it at one or
two tests on the plain function.

## First run on a new machine

```bash
cd frontend
npm install
npx playwright install chromium   # only chromium is configured

cd ../backend
npm install
cp .env.example .env              # then set SESSION_SECRET: openssl rand -base64 48
npx prisma migrate deploy         # brings dndcm up to the committed migrations
```

`dndcm_test` is brought up to the committed migrations by the suite's own
global setup, but it is not created by it: `prisma migrate deploy` fails
outright on a database that does not exist. Create it once, natively, with
`createdb -O dndcm dndcm_test`.
