"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMenuCategoryRecommendations } from "@/app/entity/menu-category-recommendation/api/menu-category-recommendation.api";
import type { MenuCategoryRecommendationRequest } from "@/app/entity/menu-category-recommendation/model/menu-category-recommendation.type";
import { menuCategoryRecommendationQueryKeys } from "./menu-category-recommendation-query-keys";

/**
 * 선택 와인으로 메뉴 카테고리 추천을 동기 조회한다.
 *
 * 동일한 선택(와인 목록)에 대한 추천은 안정적이므로 요청 wineIds를 query key로 사용하고
 * `staleTime: Infinity`로 재방문 시 재요청하지 않는다. 선택이 없으면 비활성화한다.
 */
export function useMenuCategoryRecommendationsQuery(
  request: MenuCategoryRecommendationRequest
) {
  return useQuery({
    queryKey: menuCategoryRecommendationQueryKeys.recommend(request.wineIds),
    queryFn: ({ signal }) => fetchMenuCategoryRecommendations(request, signal),
    enabled: request.wineIds.length > 0,
    staleTime: Infinity,
    retry: 1,
  });
}
