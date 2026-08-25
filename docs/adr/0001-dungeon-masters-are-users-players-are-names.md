---
status: superseded by ADR-0002
---

# Dungeon Masters are Users; Players are just names

A Campaign is owned by exactly one Dungeon Master, who is a User with an account.
Players are recorded as plain names and have no account, no login, and no identity
in the system beyond the string on the Campaign.

We considered making every person at the table a User, so that Players could sign
in and see their own Characters. We rejected it: requiring six people to create
accounts before a Dungeon Master can write down who is in the party is a real
adoption tax for a hobby app, and most players will never sign up. The Dungeon
Master is the only person who needs an account, because they are the only person
who edits anything.

## Consequences

`players: string[]` on a Campaign is deliberate, not an unfinished shortcut — do
not "fix" it into a join table. Two Campaigns listing "Alice" have no way to know
it is the same Alice, and that is accepted. If Players ever need to sign in
(Phase 4+, if Characters become player-facing), that is a new decision that
supersedes this one, not a refactor.
