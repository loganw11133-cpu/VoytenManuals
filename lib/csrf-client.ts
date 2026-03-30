/**
 * Client-side CSRF token management.
 * Fetches a token from /api/csrf and caches it for reuse.
 * The token is sent as both a cookie (auto) and x-csrf-token header.
 */

let cachedToken: string | null = null;
let fetchPromise: Promise<string> | null = null;

export async function getCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  // Deduplicate concurrent requests
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/api/csrf')
    .then(res => res.json())
    .then(data => {
      cachedToken = data.csrfToken;
      fetchPromise = null;
      return cachedToken!;
    })
    .catch(() => {
      fetchPromise = null;
      return '';
    });

  return fetchPromise;
}

/**
 * Make a POST request with CSRF token included.
 */
export async function csrfFetch(url: string, body: unknown): Promise<Response> {
  const token = await getCsrfToken();
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': token,
    },
    body: JSON.stringify(body),
  });
}
