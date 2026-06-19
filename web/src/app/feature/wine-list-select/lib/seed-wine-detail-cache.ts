import type { QueryClient } from "@tanstack/react-query";
import type { Wine } from "@/app/entity/wine/model/wine.type";
import { wineQueryKeys } from "../api/wine-query-keys";

/**
 * 검색/분석 응답에 포함된 완전한 와인 데이터를 detail query cache에 넣는다.
 * 선택 ID로 detail query를 구독하는 SelectedWineSection이 즉시 카드를 그릴 수 있다.
 */
export function seedWineDetailCache(queryClient: QueryClient, wine: Wine) {
  queryClient.setQueryData(wineQueryKeys.detail(wine.id), wine);
}
