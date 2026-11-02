const apiBaseUrl = (import.meta.env?.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(body?.error?.message || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  if (!body) throw new Error('The server returned an invalid response.');
  return body;
}
