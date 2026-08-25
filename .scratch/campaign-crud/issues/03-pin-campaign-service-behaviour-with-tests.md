# 03: Pin `CampaignService` behaviour with tests

**What to build:** A test suite that describes everything the Campaign service
promises, written entirely through its public API. This is the contract Phase 3's
rewrite has to satisfy: when the service's insides are replaced with API calls,
these tests are what tell you whether anything broke.

This is Seam A. Browser storage is the outer boundary — the real thing, cleared
between tests, written to directly when a test needs a specific stored state.
Do not introduce a storage abstraction: Phase 3 replaces this service's internals
wholesale, so an indirection built now is discarded before it is ever swapped.

Test external behaviour only. Never reach for the private signal, the storage key,
or the internal persist step — a test that breaks when the implementation is
rewritten but the behaviour is unchanged is a bad test, and this implementation
*will* be rewritten.

**Blocked by:** 02.

**Status:** ready-for-agent

- [ ] Recording a Campaign makes it retrievable
- [ ] Updating a Campaign changes it; updating one that does not exist is handled, not crashed
- [ ] Removing a Campaign removes it; removing one that does not exist is handled
- [ ] Fetching by id covers both the present and the absent case
- [ ] Campaigns recorded in one session are present in the next — persistence survives a reload
- [ ] A first run with nothing stored yields no Campaigns
- [ ] Damaged stored data recovers to a usable empty state rather than propagating a parse failure
- [ ] Storage is cleared between tests so no test depends on another's leftovers
- [ ] No test touches the service's internals
