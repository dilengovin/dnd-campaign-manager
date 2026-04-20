# DnD Campaign Manager

A full-stack web app for managing Dungeons & Dragons campaigns — campaigns, characters, quests, and inventory.

Learning project. MVP first, V2 features later.

## Stack

- **Frontend:** Angular 21 (standalone components, signals, zoneless) + TypeScript + SCSS
- **Backend:** NestJS + PostgreSQL + JWT (added in Phase 3)

## Layout

```
DnD Campaign Manager/
├── frontend/   # Angular app
└── backend/    # NestJS API (Phase 3)
```

Each subproject has its own `package.json` and tooling. The repo root holds shared docs and a single `.git`.

## Frontend — getting started

```bash
cd frontend
npm install
npm start          # dev server on http://localhost:4200
npm test           # vitest
npm run build      # production build
```

## Roadmap

1. **Phase 1** — Angular shell, routing, Login/Register/Dashboard pages
2. **Phase 2** — Campaign CRUD with mock data
3. **Phase 3** — NestJS backend + Postgres + JWT + frontend wired to API
4. **Phase 4** — Characters, quests, inventory
5. **Phase 5** — Polish, deploy, document

## License

TBD
