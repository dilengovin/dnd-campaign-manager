# 07: The rest of the fields, including Players

**What to build:** A User records everything about a Campaign, not just its name:
the Description of what the game is, who the Dungeon Master is, the Notes so far,
and every Player at the table.

Players are added one at a time — a text input and an add action, with each added
Player shown and individually removable. Not a comma-separated field and not a
textarea: splitting a string mangles names containing punctuation, and both
alternatives sidestep the dynamic-collection work that is the reason Signal Forms
was chosen for this phase.

Everything except the name stays optional. A User who has just agreed to play on
Thursday should be able to write down the name and nothing else; demanding a
Description before they can record it is friction with no payoff.

Per ADR-0002 the Dungeon Master is typed by the User like any other field — a
Campaign someone else runs is as recordable as one the User runs themselves.
Neither the Dungeon Master nor any Player is linked to an account.

This is the highest-risk ticket in the phase: an experimental API, a dynamic
collection, and thin documentation. It is isolated so that if it spirals, it blocks
as little as possible.

**Blocked by:** 06.

**Status:** ready-for-agent

- [ ] The form takes a Description, a Dungeon Master, and Notes, all optional
- [ ] Players are added one at a time and appear as they are added
- [ ] An individual Player can be removed without disturbing the others
- [ ] A Player name containing a comma or unusual punctuation is recorded exactly as typed
- [ ] The name-is-required rule is unchanged; nothing else is required
- [ ] A Campaign recorded with every field survives a reload intact
- [ ] The list card shows the Dungeon Master and how many Players there are
