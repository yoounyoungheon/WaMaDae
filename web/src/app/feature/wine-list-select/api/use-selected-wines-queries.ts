"use client";

import { useQueries } from "@tanstack/react-query";
import { fetchWineDetail } from "@/app/entity/wine/api/wine.api";
import type { Wine } from "@/app/entity/wine/model/wine.type";
import { wineQueryKeys } from "./wine-query-keys";

/**
 * 선택된 와인 ID 목록을 detail query로 조합한다.
 * 검색/분석 직후에는 detail cache가 seed되어 있어 즉시 재요청하지 않는다.
 */
export function useSelectedWinesQueries(wineIds: string[]) {
  return useQueries({
    queries: wineIds.map((wineId) => ({
      queryKey: wineQueryKeys.detail(wineId),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchWineDetail(wineId, signal),
      staleTime: Infinity,
    })),
    combine: (results) => ({
      wines: results
        .map((result) => result.data)
        .filter((wine): wine is Wine => Boolean(wine)),
    }),
  });
}
