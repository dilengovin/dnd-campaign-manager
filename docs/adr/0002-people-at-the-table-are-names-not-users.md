---
status: accepted
supersedes: ADR-0001
---

# People at the table are names, not Users

Every Campaign belongs to the User whose account it lives in, and no field on a
Campaign names that User. Both the Dungeon Master and the Players are recorded as
plain names: nobody at the table needs an account, including the Dungeon Master.

ADR-0001 tied ownership to the Dungeon Master — a Campaign was owned by the person
running it, who had to be a User. That ruled out the common case of recording a
Campaign you play in but don't run, which the app's own seed data had assumed from
the start. We considered making run-vs-play-in a first-class, filterable
distinction on a Campaign, and rejected it as premature: it needs a filter, a form
toggle, and two empty states to earn its place, none of which Phase 2 justifies.
Making the Dungeon Master a label costs one field and leaves that door open.

## Consequences

`dm: string` and `players: string[]` are deliberately unlinked to any account — do
not "fix" either into a foreign key or a join table. Two Campaigns naming "Morgan"
have no way to know it is the same Morgan, and that is accepted. The Phase 3
schema will carry an `owner_id` that no screen ever displays, because ownership is
implicit in who is signed in. If run-vs-play-in ever needs to be visible or
filterable, that is a new decision superseding this one.
