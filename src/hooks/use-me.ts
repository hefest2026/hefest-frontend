import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/api/auth";
import { queryKeys } from "@/lib/query-keys";

/** Current user profile — fetched once per session, cached for 5 minutes. */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
  });
}
