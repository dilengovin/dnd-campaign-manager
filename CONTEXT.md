# DnD Campaign Manager

Domain language for the campaign manager. This file is a glossary only — no
implementation details, no plans. If a term here conflicts with the code, one of
the two is wrong; say so out loud.

## Language

**Campaign**:
A single ongoing Dungeons & Dragons game, recorded by one User — either a game
they run or one they play in. The top-level thing everything else in the app
hangs off.
_Avoid_: Game, session, adventure, table

**User**:
Someone with an account who can sign in. Every Campaign belongs to exactly one
User: the one whose account it lives in. No field on a Campaign names this
person — it is who you are signed in as.
_Avoid_: Account, profile, owner

**Email**:
The one thing a User is identified by. Unique across the app, and never shown
on any screen — it is how you sign in, not something anyone looks at.
_Avoid_: Username, login, handle, address

**Session**:
The signed-in state a User holds, from signing in until they sign out or it
expires. A User with no Session sees only the sign-in and registration screens.
_Avoid_: Token, auth, credentials, logged-in state

**Sign in**:
What a User does to start a Session, and the canonical verb for it everywhere —
in prose, in UI copy, and in test names. Signing out ends a Session.
_Avoid_: Log in, log on, authenticate, sign on

**Dungeon Master**:
The person who runs a Campaign, recorded as a name. Often the User themselves,
but not necessarily — you can record a Campaign someone else runs. A Dungeon
Master does not need an account.
_Avoid_: DM (in prose), GM, game master, owner, host

**Player**:
Someone who plays in a Campaign, recorded as a name. A Player does not need an
account.
_Avoid_: Member, participant, party member

**Description**:
What a Campaign *is* — its premise, setting, or pitch. Written once when the
Campaign is recorded and rarely changed after.
_Avoid_: Summary, blurb, about

**Notes**:
Where a Campaign has *got to* — the running log of what has happened and what
comes next. Appended to session after session.
_Avoid_: Log, journal, session notes, comments
