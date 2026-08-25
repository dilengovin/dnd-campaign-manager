# 05: Campaigns becomes the app's home, with an empty state

**What to build:** A User signs in, lands on their Campaigns, and — having none —
is told so plainly and invited to record their first. The first tracer bullet: a
complete path from route to screen, demoable on its own.

The Dashboard is deleted. Its only content was a heading and a note promising this
feature, and a dashboard that summarises one kind of thing shows a number you could
get by looking at the list. Its route redirects to the Campaign list so existing
links still resolve, and the navigation link changes from Dashboard to Campaigns.
The reserved comment for Characters and Quests stays for Phase 4.

The empty state is not an edge case here — with seeding gone (ticket 02), it is the
*first screen a User sees*. It gets a heading, a plain statement that there are no
Campaigns yet, and a clear way to record one. It does not redirect to the form:
being thrown into a form on first load, with no way back to a list you are allowed
to see empty, is a trap.

**Blocked by:** 02.

**Status:** ready-for-agent

- [ ] A `/campaigns` route renders inside the authenticated Layout
- [ ] With no Campaigns, it shows a heading, an explanation, and a call to action to record one
- [ ] The empty state does not redirect anywhere
- [ ] The Dashboard component is gone and its route redirects to the Campaign list
- [ ] The navigation link reads Campaigns and marks itself active on that route
- [ ] A component test asserts the empty state renders when there are no Campaigns
