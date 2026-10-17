import { clearToken, getToken } from './auth.ts';
import type {
  AuthUser,
  Author,
  AuthorOption,
  AuthorStats,
  AuthorUpdate,
  LoginResponse,
  NewAuthor,
  NewPost,
  PaginatedAuthors,
  Post,
  PostUpdate,
} from './types.ts';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(path, { ...init, headers });
  if (res.status === 401 && !path.startsWith('/auth/')) {
    clearToken();
    window.location.href = '/login';
    throw new ApiError(401, 'Session expired, please log in again');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message || 'Request failed');
  }
  return res.json() as Promise<T>;
}

// --- Auth ---
export function login(email: string, password: string): Promise<LoginResponse> {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string): Promise<{ user: AuthUser }> {
  return request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

// --- Authors ---
export function getAuthors(page = 1, limit = 20): Promise<PaginatedAuthors> {
  return request(`/author?page=${page}&limit=${limit}`);
}

export function getAuthor(id: number): Promise<Author> {
  return request(`/author/${id}`);
}

export function getAuthorStats(): Promise<AuthorStats> {
  return request('/author/stats');
}

export function getAuthorOptions(): Promise<AuthorOption[]> {
  return request('/author/options');
}

export function createAuthor(data: NewAuthor): Promise<Author> {
  return request('/author', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateAuthor(id: number, data: AuthorUpdate): Promise<Author> {
  return request(`/author/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteAuthor(id: number): Promise<{ success: boolean }> {
  return request(`/author/${id}`, { method: 'DELETE' });
}

// --- Posts ---
export function createPost(data: NewPost): Promise<Post> {
  return request('/author/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updatePost(id: number, data: PostUpdate): Promise<Post> {
  return request(`/author/post/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deletePost(id: number): Promise<{ success: boolean }> {
  return request(`/author/post/${id}`, { method: 'DELETE' });
}
