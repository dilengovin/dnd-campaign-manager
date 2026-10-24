---
status: accepted
---

# A Session is an httpOnly cookie, not a token the app can read

A Session is carried by a JWT in an `httpOnly`, `SameSite=Strict` cookie that the
backend sets and the frontend never sees. The obvious alternative — and the one
the Phase 3 roadmap line assumed — was a JWT in `localStorage` sent as an
`Authorization: Bearer` header. We rejected it: anything that can run JavaScript
on the page can read `localStorage`, and a Campaign's Notes are the one thing in
this app a User would mind losing. The cookie closes that off completely, because
there is no API by which script can read it.

The cost is CSRF, which `localStorage` does not have. We pay it twice over:
`SameSite=Strict` means the cookie is never attached to a cross-site request in
the first place, and a double-submit token (a readable `XSRF-TOKEN` cookie echoed
back in a header, which Angular's `HttpClient` does natively and a Nest guard
verifies) covers the rest. `SameSite=Strict` is affordable here only because the
app is a SPA that establishes its Session over XHR after boot — the usual
complaint, that a link from another site lands you signed out, never applies.

## Consequences

**Logout is client-side only.** The JWT is stateless: `POST /api/auth/logout`
clears the cookie, but the token itself stays valid until it expires. Anyone
holding a copy is still signed in, and the server cannot revoke it. This is the
reason the expiry is 7 days rather than something longer — the window is the only
control we have. Making Sessions genuinely revocable means a Session table and a
database read on every request; if that is ever wanted, it supersedes this
decision rather than extending it.

**The frontend cannot tell whether it is signed in.** Script cannot read the
cookie, so Session state is not a local lookup. `GET /api/auth/me` is the only
answer, called once on boot and cached in a signal; the route guard resolves
against that, and any 401 anywhere is treated as "the Session is gone".

**The dev server proxies `/api` to the backend.** Same-origin in development is
what lets the cookie work with no CORS configuration at all — do not "fix" the
proxy away by enabling CORS with credentials.
