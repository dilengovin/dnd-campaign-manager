# 10: Remove a Campaign

**What to build:** A User removes a Campaign that ended or never started, and it
takes two deliberate actions to do it. Removal is permanent — there is no undo and
no backup — so a single misclick must not be able to destroy a Campaign a User
meant to keep.

The confirmation appears on the thing the User clicked: the remove control on that
Campaign becomes a confirm control, so there is never any doubt about which
Campaign is about to go. A second activation removes it. Backing out returns the
control to its resting state and leaves no trace — the list looks exactly as it did
before.

The browser's native confirm dialog is explicitly rejected: it blocks the main
thread and cannot be tested without stubbing a global.

Only needs Campaign cards to exist, so it does not wait on the forms work.

**Blocked by:** 06.

**Status:** ready-for-agent

- [ ] Each Campaign in the list offers a way to remove it
- [ ] A single activation does not remove anything — it asks for confirmation in place
- [ ] A second activation removes the Campaign, and it disappears from the list
- [ ] The removal can be backed out of, leaving the Campaign and the list unchanged
- [ ] Confirmation state belongs to one Campaign only — it never appears on another card
- [ ] The removal survives a reload; the Campaign does not come back
- [ ] A component test asserts removal requires two activations and can be backed out of
