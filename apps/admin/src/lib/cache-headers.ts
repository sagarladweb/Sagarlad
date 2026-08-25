// Prevent browser/CDN from caching admin API responses. Admin data (post
// lists, subscriber emails, etc.) must never be served from cache.
export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
} as const;
