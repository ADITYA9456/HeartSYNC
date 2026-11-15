// Turn an api-client error into a message people can act on. Server 5xx
// responses ("Internal server error") and network failures get a calm,
// human fallback; 4xx messages from the API are already user-facing.
export function friendlyError(e, fallback = 'Something went wrong. Please try again.') {
  if (!e) return fallback;
  if (!e.status) {
    return typeof navigator !== 'undefined' && navigator.onLine === false
      ? 'You seem to be offline. Reconnect and try again.'
      : fallback;
  }
  if (e.status >= 500 || /internal server error/i.test(e.message || '')) return fallback;
  return e.message || fallback;
}
