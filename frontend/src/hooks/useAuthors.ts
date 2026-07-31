import { useQuery } from '@tanstack/react-query';
import { getAuthors } from '../lib/api.ts';
import type { Author } from '../lib/types.ts';

export function useAuthors() {
  return useQuery<Author[]>({
    queryKey: ['authors'],
    queryFn: getAuthors,
  });
}
