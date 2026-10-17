import { useQuery } from '@tanstack/react-query';
import { getAuthorStats } from '../lib/api.ts';
import type { AuthorStats } from '../lib/types.ts';

export function useAuthorStats() {
  return useQuery<AuthorStats>({
    queryKey: ['author-stats'],
    queryFn: getAuthorStats,
  });
}
