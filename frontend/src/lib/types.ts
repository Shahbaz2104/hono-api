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

export type NewAuthor = { name: string; email: string; age?: number };
export type NewPost = { title: string; content: string; authorId: number };
export type AuthorUpdate = Partial<NewAuthor>;
export type PostUpdate = Partial<Omit<NewPost, 'authorId'>> & { authorId?: number };
