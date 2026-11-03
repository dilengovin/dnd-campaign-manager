/**
 * The cookie and header names are Angular's `HttpClient` defaults, not names of
 * our own. The frontend slice then configures this protection rather than
 * reimplementing it: `HttpClient` reads this cookie and echoes it in this
 * header with no interceptor written by hand.
 */
export const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
export const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';
