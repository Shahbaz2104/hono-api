import type { Author } from './types.ts';

export interface Analytics {
  totalAuthors: number;
  totalPosts: number;
  topAuthor: { name: string; postCount: number } | null;
}

export function computeAnalytics(authors: Author[]): Analytics {
  const totalAuthors = authors.length;
  const totalPosts = authors.reduce((sum, author) => sum + author.posts.length, 0);

  let topAuthor: Analytics['topAuthor'] = null;
  for (const author of authors) {
    const postCount = author.posts.length;
    if (postCount > 0 && (!topAuthor || postCount > topAuthor.postCount)) {
      topAuthor = { name: author.name, postCount };
    }
  }

  return { totalAuthors, totalPosts, topAuthor };
}
