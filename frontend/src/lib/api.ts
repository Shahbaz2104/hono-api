import type { Author, AuthorUpdate, NewAuthor, NewPost, Post, PostUpdate } from './types.ts';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export function getAuthors(): Promise<Author[]> {
  return request('/author');
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
