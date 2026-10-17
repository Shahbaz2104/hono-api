const TOKEN_KEY = 'publisher_cms_token';
const USER_KEY = 'publisher_cms_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthed(): boolean {
  return getToken() !== null;
}
