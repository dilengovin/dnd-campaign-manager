# Spec: Campaign CRUD (Phase 2)

Status: ready-for-agent
Vocabulary: see `CONTEXT.md`. Decisions: see `docs/adr/0002-people-at-the-table-are-names-not-users.md`.

## Problem Statement

A User can sign in to the app and reach a Dashboard, and that is all it does. The
Dashboard says "Campaign list lands here in Phase 2" and shows nothing. There is
no way to see a Campaign, no way to record one, no way to change or remove one.

Underneath, the machinery to manage Campaigns already exists and works — a
service holding Campaigns in a signal, persisting them to browser storage,
offering create, update and delete. None of it is reachable. Every one of those
operations is unreachable from the screen, and unproven: no test exercises them
and no UI calls them. The three Campaigns a User does see are seeded fixtures
they never created and cannot meaningfully change.

So the app is a shell with a working engine bolted inside it and no controls
attached.

## Solution

A User can manage their Campaigns, end to end, from the browser.

`/campaigns` becomes the home of the app. It lists every Campaign the User has
recorded, one card each, showing enough to tell them apart. From there a User can
record a new Campaign, open one to read it in full, change it, or remove it.
Removal takes two deliberate clicks, because it cannot be undone.

Opening a Campaign shows everything about it — including its Notes, the running
log of where the game has got to, which is the field a User will open the app to
write session after session.

A User arriving for the first time sees an empty list that invites them to record
their first Campaign, not a set of fixtures pretending to be their data. Every
Campaign in the app is one the User put there.

Both the game a User runs and the game they play in are recordable: the Dungeon
Master is a name they type, not an identity the app enforces.

## User Stories

1. As a User, I want to see all my Campaigns in one place, so that I can find the one I care about without remembering where I put it.
2. As a User, I want the Campaign list to be the app's home, so that I land on my actual content rather than a summary of it.
3. As a User, I want each Campaign in the list shown as a card with its name, so that I can scan the list quickly.
4. As a User, I want each card to show the Dungeon Master, so that I can tell my games apart from the ones I play in.
5. As a User, I want each card to show how many Players are in the Campaign, so that I get a sense of the table's size at a glance.
6. As a User, I want the list to stay readable when a Campaign has long Notes, so that one verbose entry doesn't drown out the rest.
7. As a User, I want to be told plainly when I have no Campaigns yet, so that I don't mistake an empty screen for a broken one.
8. As a User, I want a clear call to action on the empty list, so that I know what to do first.
9. As a User with no Campaigns, I want to stay on the list rather than being thrown into a form, so that I can look around before committing to anything.
10. As a User, I want to record a new Campaign, so that I can start tracking a game I am about to play.
11. As a User, I want to give a Campaign a name, so that I can recognise it later.
12. As a User, I want to be stopped from recording a Campaign with no name, so that I never end up with an unidentifiable entry in my list.
13. As a User, I want every field except the name to be optional, so that I can jot down a game I've just agreed to play without filling in a form I don't have answers for yet.
14. As a User, I want to write a Description when recording a Campaign, so that I remember its premise months later.
15. As a User, I want to record who the Dungeon Master is, so that I can track games other people run as well as my own.
16. As a User, I want to add Players one at a time, so that names with commas or unusual punctuation are recorded exactly as I typed them.
17. As a User, I want to remove a Player I added by mistake, so that I can correct the party without starting the form over.
18. As a User, I want to see the Players I have added so far while filling in the form, so that I can tell whether I have missed anyone.
19. As a User, I want to be returned to the Campaign list after recording a Campaign, so that I can see it took effect.
20. As a User, I want to abandon recording a Campaign without saving, so that a change of mind costs me nothing.
21. As a User, I want to open a Campaign and see everything recorded about it, so that I have one place to read the full picture.
22. As a User, I want a Campaign's Notes shown in full when I open it, so that I can read back what happened last session.
23. As a User, I want a Campaign's Description shown when I open it, so that I can remind myself what the game is about.
24. As a User, I want to see every Player listed by name when I open a Campaign, so that I know exactly who is at the table.
25. As a User, I want to get back to the list from a Campaign, so that I am never stranded on a page.
26. As a User, I want to edit a Campaign, so that I can correct a mistake or record something that has changed.
27. As a User, I want the edit form to arrive filled in with the Campaign's current values, so that I only change what I mean to change.
28. As a User, I want to add and remove Players when editing, so that I can keep the party current as people join and leave.
29. As a User, I want to update a Campaign's Notes, so that I can log what happened in the session I just played.
30. As a User, I want to abandon an edit without saving, so that opening the form to look is not the same as changing something.
31. As a User, I want the same name-is-required rule when editing as when recording, so that the app behaves consistently.
32. As a User, I want to remove a Campaign, so that a game that ended or never started stops cluttering my list.
33. As a User, I want removal to take two deliberate actions, so that a misclick doesn't destroy a Campaign I meant to keep.
34. As a User, I want the confirmation to appear on the thing I clicked, so that I am never in doubt about which Campaign I am about to remove.
35. As a User, I want a chance to back out of a removal I started, so that reconsidering costs nothing.
36. As a User, I want a removal I abandoned to leave no trace, so that the list looks the way it did before I clicked.
37. As a User, I want my Campaigns to still be there when I come back tomorrow, so that the app is worth putting real information into.
38. As a User, I want the app to recover rather than break if its stored data is damaged, so that one corrupt entry doesn't cost me the app.
39. As a User, I want the navigation to point at Campaigns, so that the app's own menu reflects what the app actually does.
40. As a User, I want an old bookmark to the Dashboard to still land somewhere useful, so that a saved link doesn't break.
41. As a User, I want the app to look consistent from screen to screen, so that it feels like one app rather than a set of pages.
42. As a developer, I want the Campaign service's behaviour covered by tests, so that Phase 3 can replace its internals with API calls and know immediately if anything broke.
43. As a developer, I want the test suite to compile and run, so that I get feedback at all.
44. As a developer, I want all Campaign code under one feature folder, so that I can find it as the feature grows through Phase 4.
45. As a developer, I want colours defined in one place, so that adding a screen doesn't mean guessing a hex code.

## Implementation Decisions

### Scope of the surface

Full create-read-update-delete. Every method the Campaign service already exposes
gets a surface. Nothing on the service is left dormant.

### Routing

Four Campaign routes, all inside the authenticated Layout branch:

- the Campaign list, which is the app's home
- the record-a-Campaign form
- a Campaign's detail view, keyed by its id
- a Campaign's edit form, keyed by its id

The Dashboard is deleted. Its route redirects to the Campaign list so existing
links resolve. The Layout's navigation link changes from Dashboard to Campaigns;
the reserved comment for Characters and Quests stays for Phase 4.

The detail route is not redundant with the list: the list shows a summary (name,
Dungeon Master, Player count) and the detail view shows everything, with
Description and Notes appearing only there. Notes is unbounded and would make a
list of cards unreadable.

The detail route also has a second job — it is where Characters, Quests and
Inventory hang off a Campaign in Phase 4. Establishing it now means Phase 4 adds
children to an existing route rather than restructuring.

### Feature structure

All Campaign code consolidates under a single `campaigns` feature folder: the
model, the service, and every component. The current split — service and model in
one folder, list component as a sibling — is not carried forward. `features/`
maps to features, not to screens.

### Domain model

The `Campaign` shape is unchanged in structure. One rename: the Dungeon Master
field drops its `Name` suffix, since per ADR-0002 it is a name and nothing else,
and the suffix implied a distinction from a non-name variant that does not exist.

Per ADR-0002 the Dungeon Master is typed by the User like any other field, and
neither it nor Players link to any account. Ownership is implicit in whose browser
storage the Campaign lives in and is not represented on the Campaign at all.

Description and Notes are distinct terms with distinct lifespans, per `CONTEXT.md`:
Description is written once when recording and rarely revisited; Notes is appended
to session after session. This is why Notes gets prominence on the detail view.

### Seed data

Seeding is removed entirely. A fresh browser starts with no Campaigns. This is
deliberate: it forces the empty state to exist and be seen, and it makes the
record-a-Campaign form the only path by which data enters the app, which puts
real pressure on it. The service's storage-loading behaviour stays; only the
fallback fixtures go.

### Forms

Angular Signal Forms (`@angular/forms/signals`), chosen deliberately over Reactive
Forms despite being marked experimental in Angular 21. The app is zoneless and
signal-based throughout and the service already exposes signals, so Signal Forms
match the grain of the codebase. Learning that API — specifically the dynamic
Players collection — is an explicit goal of this phase.

Validation: name is required, everything else optional. Submission is blocked
while the name is empty.

Players are entered through an add-and-remove collection: a text input plus an
add action, with each added Player shown and individually removable. Not a
comma-separated string and not a textarea — splitting a string would mangle names
containing punctuation, and both alternatives sidestep the dynamic-collection work
that is the point of choosing this API.

The record and edit forms share their field structure. The edit form is
initialised from the Campaign being edited.

### Removal

Two-step inline confirmation, held in component state. The remove control on a
Campaign becomes a confirm control; a second activation performs the removal, and
backing out returns it to its resting state. The browser's native confirm dialog
is explicitly rejected: it blocks the main thread and cannot be tested without
stubbing a global.

### Styling

No CSS framework. TailwindCSS was present before the Angular 21 re-scaffold and
was dropped by it; it is not being reinstated here. Reintroducing it, if wanted,
is its own deliberate change and not something to smuggle inside a feature.

The existing hand-written component SCSS is kept, but the hardcoded colour values
scattered through it are extracted into CSS custom properties in the global
stylesheet first, before new components multiply them. Phase 2 is the first point
at which a colour is repeated across four components.

### Starting state

The working tree's uncommitted work is discarded rather than built on: the
Dashboard edits wire in a component on a page this spec deletes, and the
scaffolded list component is four CLI-generated files that regenerate identically
in their correct location.

## Testing Decisions

### What makes a good test here

Tests assert external behaviour, never implementation. For the service that means
going through its public API and observing what comes back out of it or what
survives a reload — never reaching for its private signal, its storage key, or
its internal persist step. For components it means asserting what renders and what
happens when a User interacts, not which method was called.

A test that breaks when the implementation is rewritten but the behaviour is
unchanged is a bad test, and Phase 3 will rewrite this service's internals
entirely. That is the standard these tests are written to.

### Prerequisite: the suite does not currently run

The scaffolded service spec references a class name that no longer exists, so the
build fails to compile and no test in the project runs. Fixing that comes first;
every other slice depends on it.

### Seams

Two seams, both already present in the codebase. No new seams are introduced.

**Seam A — the Campaign service's public API, over real browser storage.** This
carries the weight of the coverage. Browser storage is the outer boundary: the
real thing is used, cleared between tests, and written to directly when a test
needs to set up a specific stored state. A storage abstraction is explicitly
rejected — Phase 3 replaces this service's internals with API calls, so an
indirection built now would be discarded before it was ever swapped.

Covered at this seam: recording a Campaign and getting it back; updating one and
seeing the change; updating one that does not exist; removing one; removing one
that does not exist; fetching by id, present and absent; Campaigns surviving a
reload; a fresh start when nothing is stored; and recovery when what is stored is
damaged rather than propagating a parse failure.

**Seam B — component rendering through TestBed.** Light coverage only. Every
scaffolded spec in the project already uses this seam, so it is prior art as well
as an existing seam. Covered: the empty state renders when there are no
Campaigns; the list renders one card per Campaign; the two-step removal requires
two activations and can be backed out of.

### Weighting, and what is not tested

Service thoroughly, components lightly, forms not driven test-first. The service
is pure logic, is where a regression would be silent, and is the piece Phase 3
replaces — that is where coverage pays. The forms use an experimental API with
thin documentation; driving them test-first means debugging two unknowns at once
and misattributing failures. They are built, made to work by hand, and pinned
down afterwards if worth pinning.

### Prior art

The scaffolded specs are the project's only existing tests and are all
`toBeTruthy()` stubs. They are scaffolding to replace, not a pattern to follow —
except in their TestBed setup, which is the standard shape and is kept. The
runner is Vitest with jsdom, via the Angular CLI's test builder.

## Out of Scope

- **Authentication of any kind.** Login and Register stay static templates. No
  route guard is added; the Layout branch stays unguarded, as its own comment
  already notes for Phase 3.
- **Any backend.** No NestJS, no Postgres, no HTTP. Browser storage remains the
  only persistence.
- **Any representation of ownership on a Campaign.** Per ADR-0002 the owning User
  is implicit; the Phase 3 schema's owner reference is a Phase 3 concern.
- **Making run-versus-play-in a first-class distinction.** Explicitly deferred in
  ADR-0002. No filter, no toggle, no derived "my games" view.
- **Characters, Quests, and Inventory.** Phase 4. The detail route is established
  here, but stays childless.
- **Reinstating TailwindCSS**, and any broader visual redesign beyond extracting
  colours into custom properties.
- **Migrating to Signal Forms elsewhere**, or revisiting the auth screens' markup.
- **Search, sorting, filtering, or pagination** of the Campaign list.
- **Undo for removal.** Two-step confirmation is the whole safety mechanism.
- **A real Dashboard.** Deleted here; it earns its place back in Phase 4 when
  there is more than one kind of thing to summarise.

## Further Notes

- Signal Forms are marked experimental as of Angular 21.0 and the API may change
  in any 21.x minor. This is an accepted, deliberate risk taken for its learning
  value. If the API proves unworkable in practice, falling back to Reactive Forms
  is a contained change affecting two components and does not invalidate the rest
  of this spec.
- The record and edit forms are the highest-risk slices for exactly that reason.
  They should not be first, and they should not block unrelated work — the service
  test suite and the colour extraction have no dependency on them.
- Removing seed data means the app looks empty on first run. That is intended, not
  a regression.
- This spec assumes the working tree is reset before work begins. The reset is
  part of the first slice, not a prerequisite performed outside it.
