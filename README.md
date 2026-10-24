# DnD Campaign Manager

A full-stack web app for managing Dungeons & Dragons campaigns — campaigns, characters, quests, and inventory.

Learning project. MVP first, V2 features later.

## Stack

- **Frontend:** Angular 21 (standalone components, signals, zoneless) + TypeScript + SCSS
- **Backend:** NestJS + PostgreSQL (Prisma) + cookie Sessions (ADR-0003)

## Layout

```
DnD Campaign Manager/
├── frontend/   # Angular app
└── backend/    # NestJS API + Postgres (Prisma)
```

Each subproject has its own `package.json` and tooling — there is no package at
the repo root and no workspaces. The repo root holds shared docs, the Compose
file for Postgres, and a single `.git`.

## Database — getting started

Postgres runs from Compose, as one service holding two databases: `dndcm` for
the running app and `dndcm_test` for the backend suite.

```bash
docker compose up -d     # from the repo root
```

Both databases are created the first time the volume is empty. If you already
had a `dndcm-pgdata` volume from before the test database existed, create it
once by hand:

```bash
docker compose exec postgres createdb -U dndcm dndcm_test
```

## Backend — getting started

```bash
cd backend
npm install
cp .env.example .env   # DATABASE_URL and TEST_DATABASE_URL; never committed

npx prisma migrate deploy   # bring the app database up to the committed migrations
npm run start:dev           # API on http://localhost:3000, every route under /api
npm test                    # jest + supertest against the real test database
npm run build               # compile to dist/
```

`GET /api/health` answers only after a query actually reaches Postgres, so a
200 from it means the whole path is up rather than just Node. Which suite
answers which kind of question is recorded in
`.claude/skills/run-the-app/SKILL.md`, for the backend as for the frontend.

Schema changes are migrations only: edit `backend/prisma/schema.prisma`, run
`npx prisma migrate dev --name <what-changed>`, and commit what it writes.

## Frontend — getting started

```bash
cd frontend
npm install
npx playwright install chromium   # browser for the end-to-end harness

npm start          # dev server on http://localhost:4200
npm test           # unit suite (vitest + jsdom)
npm run test:e2e   # end-to-end suite (playwright, real browser)
npm run build      # production build
```

`npm test` is the unit suite alone and stays fast; `npm run test:e2e` drives a
real browser and starts the dev server itself, reusing one already on port 4200
if it finds it.

## Roadmap

1. **Phase 1** — Angular shell, routing, Login/Register/Dashboard pages
2. **Phase 2** — Campaign CRUD with mock data
3. **Phase 3** — NestJS backend + Postgres + JWT + frontend wired to API *(in progress)*
4. **Phase 4** — Characters, quests, inventory
5. **Phase 5** — Polish, deploy, document

## License

TBD
