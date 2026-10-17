import { useQuery } from '@tanstack/react-query';
import { getAuthorOptions } from '../lib/api.ts';
import type { AuthorOption } from '../lib/types.ts';

export function useAuthorOptions() {
  return useQuery<AuthorOption[]>({
    queryKey: ['author-options'],
    queryFn: getAuthorOptions,
  });
}
