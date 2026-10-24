---
name: run-the-app
description: Run the DnD Campaign Manager frontend or backend, or drive the app in a real browser to check a change on screen. Use when asked to run, start, serve, or screenshot the app, to bring up Postgres, or to confirm routing or a click works in the real app rather than in a unit test.
---

# Run the app

Nothing runs from the repo root except Compose: there is no `package.json`
there. Frontend commands run from `frontend/`, backend commands from `backend/`.

## Serve it

```bash
cd frontend
npm start            # http://localhost:4200
```

The dev server is zoneless Angular 21 with hot reload. First build on a cold
`.angular/cache` takes up to a minute; later rebuilds are seconds.

The backend needs Postgres up first, and lives on its own port:

```bash
docker compose up -d   # from the repo root; Postgres for the app and the tests
cd backend
npm run start:dev      # http://localhost:3000, every route under /api
```

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

`npm test` in `frontend/` is the unit suite alone and stays that way — it is the
fast one and gets run constantly. `npm test` in `backend/` boots the real Nest
application against the `dndcm_test` database, never the application's own, and
truncates between tests; nothing is mocked there, Prisma least of all. It needs
Compose up.

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

## First run on a new machine

```bash
cd frontend
npm install
npx playwright install chromium   # only chromium is configured
```
