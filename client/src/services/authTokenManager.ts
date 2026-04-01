let accessToken: string | null = null;

/** Decode JWT token without verification (for expiration check only) */
function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode token:', e);
    return null;
  }
}

/** Check if token is expired */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/** Get remaining time in token (in seconds) */
export function getTokenTimeRemaining(token: string | null): number {
  if (!token) return 0;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, decoded.exp - currentTime);
}

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
