let accessToken: string | null = null;

/** Set the in-memory access token used by API requests. */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Read the in-memory access token. */
export function getAccessToken(): string | null {
  return accessToken;
}

/** Clear all auth data from memory and legacy local storage. */
export function clearAuthState(): void {
  accessToken = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
