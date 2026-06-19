import type { QueryClient } from "@tanstack/react-query";
import type {
  Wine,
  WineId,
} from "@/app/entity/wine/model/wine.type";
import { wineQueryKeys } from "../api/wine-query-keys";

export type KnownWines = Partial<Record<WineId, Wine>>;

/**
 * 검색 또는 분석 응답에 포함된 완전한 와인 데이터를 한 cache에 합친다.
 */
export function cacheKnownWines(queryClient: QueryClient, wines: Wine[]) {
  queryClient.setQueryData<KnownWines>(
    wineQueryKeys.known(),
    (currentWines = {}) => {
      const nextWines = { ...currentWines };

      wines.forEach((wine) => {
        nextWines[wine.id] = wine;
      });

      return nextWines;
    }
  );
}
