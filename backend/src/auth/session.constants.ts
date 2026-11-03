/**
 * The cookie a Session travels in. Nothing outside the backend ever reads it —
 * it is `httpOnly`, which is the whole point of ADR-0003 — so the name is ours
 * alone, unlike the CSRF cookie whose name Angular dictates.
 */
export const SESSION_COOKIE_NAME = 'session';

/**
 * Seven days, and not longer. The Session is a stateless JWT with no
 * server-side revocation, so this window is the *only* control over a cookie
 * that has been copied. Read ADR-0003 before extending it.
 */
export const SESSION_LIFETIME_SECONDS = 7 * 24 * 60 * 60;
