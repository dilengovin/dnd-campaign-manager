# 06: Record a Campaign, and see it in the list

**What to build:** A User records their first Campaign — just a name — and lands
back on the list to find it there. The empty state gives way to a card. This is the
moment the app holds something a User put into it.

Name only, deliberately. This is the project's first contact with Angular's Signal
Forms, an API marked experimental with thin documentation; the smallest possible
form proves it works before ticket 07 asks it to manage a dynamic collection.

A Campaign cannot be recorded without a name — an unnamed Campaign is
unidentifiable in a list. Submission is blocked until there is one. A User can also
abandon the form without saving: a change of mind should cost nothing.

The list renders one card per Campaign, showing its name.

**Blocked by:** 05.

**Status:** ready-for-agent

- [ ] A route exists for recording a new Campaign, reachable from the list and from the empty state
- [ ] The form takes a name and refuses to submit without one
- [ ] Submitting records the Campaign and returns the User to the list
- [ ] The newly recorded Campaign appears in the list as a card showing its name
- [ ] The form can be abandoned without recording anything
- [ ] The recorded Campaign is still there after a reload
- [ ] A component test asserts the list renders one card per Campaign
