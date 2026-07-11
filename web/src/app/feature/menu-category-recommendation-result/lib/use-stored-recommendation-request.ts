"use client";

import { useEffect, useState } from "react";
import { loadMenuCategoryRecommendationRequest } from "@/app/entity/menu-category-recommendation/lib/recommendation-request-storage";
import type { MenuCategoryRecommendationRequest } from "@/app/entity/menu-category-recommendation/model/menu-category-recommendation.type";

type StoredRecommendationRequest = {
  request: MenuCategoryRecommendationRequest | null;
  isHydrated: boolean;
};

/**
 * sessionStorage에 저장된 추천 요청 스냅샷을 읽는다.
 *
 * 서버 렌더에서는 window가 없으므로 hydration 이후 클라이언트에서 한 번 읽는다.
 * `isHydrated`로 최초 렌더의 hydration mismatch와 빈 상태 깜빡임을 구분한다.
 */
export function useStoredMenuCategoryRecommendationRequest(): StoredRecommendationRequest {
  const [state, setState] = useState<StoredRecommendationRequest>({
    request: null,
    isHydrated: false,
  });

  useEffect(() => {
    setState({
      request: loadMenuCategoryRecommendationRequest(),
      isHydrated: true,
    });
  }, []);

  return state;
}
