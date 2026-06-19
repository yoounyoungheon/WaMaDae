"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWineSearch } from "@/app/entity/wine/api/wine.api";
import { wineQueryKeys } from "./wine-query-keys";

export function useWineSearchQuery(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: wineQueryKeys.search(normalizedQuery),
    queryFn: ({ signal }) => fetchWineSearch(normalizedQuery, signal),
    enabled: normalizedQuery.length > 0,
    staleTime: 60_000,
  });
}
