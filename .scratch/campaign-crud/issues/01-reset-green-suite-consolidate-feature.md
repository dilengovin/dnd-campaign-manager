# 01: Reset the working tree, get the suite compiling, consolidate the Campaign feature

**What to build:** Nothing a User can see. This clears the ground so every ticket
after it starts from a known state: the test suite runs, and all Campaign code
lives in one place.

Three things happen. The uncommitted work in the tree is discarded — it wires a
component into a page that ticket 05 deletes, and the scaffolded list component is
CLI output that regenerates identically where it belongs. The scaffolded service
spec references a class name that no longer exists, so the build fails to compile
and *no test in the project runs*; that import is corrected. And the Campaign
model, service, and components are consolidated under a single `campaigns` feature
folder, rather than the current split where the service sits in one folder and the
list component is its sibling.

No behaviour changes. This is prefactoring: make the change easy, then make the
easy change.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] The working tree's uncommitted Dashboard edits and scaffolded list component are gone
- [ ] `npm test` compiles and runs to completion — this has never happened in this repo
- [ ] The scaffolded service spec's assertion is meaningful or the file is a clean starting point for ticket 03; it does not assert against a class name that no longer exists
- [ ] The Campaign model, service, and any Campaign component live under one feature folder
- [ ] `npm run build` still succeeds
- [ ] No user-visible behaviour has changed
