import { useQuery } from "@tanstack/react-query";
import { listProviders } from "@/api/auth";
import { queryKeys } from "@/lib/query-keys";

/** Available auth providers (password + OAuth). Rarely changes, so cache long. */
export function useProviders() {
  return useQuery({
    queryKey: queryKeys.providers(),
    queryFn: listProviders,
    staleTime: 1000 * 60 * 30,
  });
}
