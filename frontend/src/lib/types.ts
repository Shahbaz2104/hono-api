export interface Post {
  id: number;
  title: string;
  content: string;
}

export interface Author {
  id: number;
  name: string;
  email: string;
  age?: number | null;
  posts: Post[];
}

export interface PaginatedAuthors {
  items: Author[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthorStats {
  totalAuthors: number;
  totalPosts: number;
  topAuthor: { name: string; postCount: number } | null;
}

export interface AuthorOption {
  id: number;
  name: string;
}

export interface AuthUser {
  id: number;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export type NewAuthor = { name: string; email: string; age?: number };
export type NewPost = { title: string; content: string; authorId: number };
export type AuthorUpdate = Partial<NewAuthor>;
export type PostUpdate = Partial<Omit<NewPost, 'authorId'>> & { authorId?: number };
