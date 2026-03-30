import { useQuery } from '@tanstack/react-query'
import { getLocation } from '../apis/locations.ts'

export function useLocation(slug: string) {
  return useQuery({
    queryKey: ['location', slug],
    queryFn: () => getLocation(slug),
  })
}
