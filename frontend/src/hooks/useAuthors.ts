import { useQuery } from '@tanstack/react-query';
import { getAuthors } from '../lib/api.ts';
import type { PaginatedAuthors } from '../lib/types.ts';

export function useAuthors(page = 1, limit = 20) {
  return useQuery<PaginatedAuthors>({
    queryKey: ['authors', page, limit],
    queryFn: () => getAuthors(page, limit),
  });
}
