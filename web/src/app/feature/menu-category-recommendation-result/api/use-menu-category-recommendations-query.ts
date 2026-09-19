"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMenuRecommendations } from "@/app/entity/menu-category-recommendation/api/menu-category-recommendation.api";
import { menuRecommendationQueryKeys } from "./menu-category-recommendation-query-keys";

/**
 * 같은 세션과 선택 wine으로 메뉴 추천을 조회한다.
 *
 * `POST`지만 화면 생명주기 동안 같은 입력을 재사용하는 조회 성격이다.
 * backend가 추천 결과를 세션에 저장하므로 자동 refetch/retry는 결과를 바꿀 수 있어
 * `staleTime: Infinity`, `refetchOnWindowFocus: false`, `retry: 0`으로 둔다.
 */
export function useMenuRecommendationsQuery(
  sessionId: string | null,
  pairingWineIds: string[]
) {
  return useQuery({
    queryKey: menuRecommendationQueryKeys.recommend(
      sessionId ?? "",
      pairingWineIds
    ),
    queryFn: ({ signal }) =>
      fetchMenuRecommendations(sessionId as string, { pairingWineIds }, signal),
    enabled: Boolean(sessionId) && pairingWineIds.length > 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 0,
  });
}
