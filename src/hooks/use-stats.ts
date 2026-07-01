import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/api/stats";
import { queryKeys } from "@/lib/query-keys";

/** Organizer dashboard aggregates. Enable only for organizers (403 otherwise). */
export function useStats(enabled = true) {
  return useQuery({
    queryKey: queryKeys.stats(),
    queryFn: getStats,
    staleTime: 1000 * 60,
    enabled,
  });
}
