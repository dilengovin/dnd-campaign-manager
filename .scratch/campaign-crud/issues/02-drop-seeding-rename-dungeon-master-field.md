# 02: Drop seeding, rename the Dungeon Master field

**What to build:** A fresh browser starts with no Campaigns at all. Today the app
invents three Campaigns on first run — fixtures a User never created, one of them
run by a Dungeon Master they have never met. Those go. From here, the only way a
Campaign exists is that a User recorded it.

Alongside that, the Campaign's Dungeon Master field drops its `Name` suffix. Per
ADR-0002 the Dungeon Master is a name and nothing else; the suffix implied a
distinction from some non-name variant that does not exist.

Deliberately early: it settles the Campaign's shape and the service's startup
behaviour before anything is written against them, so no later ticket gets
rewritten. Everything the service does with stored Campaigns stays — only the
fallback fixtures go.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] A browser with empty storage starts with zero Campaigns
- [ ] No fixture Campaigns exist anywhere in the codebase
- [ ] The Dungeon Master field is named for what it is — a name — with no redundant suffix
- [ ] Loading Campaigns from storage, and recovering from damaged storage, both still work
- [ ] `npm test` and `npm run build` both pass
