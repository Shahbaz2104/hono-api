import { useQuery } from '@tanstack/react-query';
import { getAuthor } from '../lib/api.ts';
import type { Author } from '../lib/types.ts';

export function useAuthor(id: number) {
  return useQuery<Author>({
    queryKey: ['author', id],
    queryFn: () => getAuthor(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
