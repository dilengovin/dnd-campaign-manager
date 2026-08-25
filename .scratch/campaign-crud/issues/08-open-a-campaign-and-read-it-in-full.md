# 08: Open a Campaign and read it in full

**What to build:** A User opens a Campaign from the list and sees everything
recorded about it — the Description of what the game is, the Notes of where it has
got to, and every Player by name. A way back to the list, so they are never
stranded.

The list stays a summary and this page holds the detail. That division is the
reason this route exists: Notes grows without limit — "Party just arrived in
Vallaki" today, three paragraphs by session twelve — and a list of cards each
carrying a wall of text is unreadable. Notes gets prominence here, because it is
the field a User opens the app to read.

The route also has a second job. Phase 4 hangs Characters, Quests, and Inventory
off a Campaign, and they hang off here. Establishing it now makes Phase 4 an
addition rather than a restructure — but it stays childless for now.

**Blocked by:** 07.

**Status:** ready-for-agent

- [ ] A Campaign has its own route, reachable by opening it from the list
- [ ] The page shows the Campaign's name, Description, Dungeon Master, and Notes in full
- [ ] Every Player is listed by name, not merely counted
- [ ] There is a clear way back to the Campaign list
- [ ] A Campaign with empty optional fields renders sensibly rather than showing blank gaps
- [ ] Requesting a Campaign that does not exist is handled rather than crashing
