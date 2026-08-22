import type { Wine } from "@/app/entity/wine/model/wine.type";
import { normalizeUuid } from "@/app/shared/lib/validation/uuid";
import type { MenuCategoryRecommendationRequest } from "../model/menu-category-recommendation.type";

/**
 * 선택 와인 목록을 추천 요청 body로 변환하는 순수 함수.
 *
 * 백엔드는 와인 UUID 문자열만 요구한다. OCR/DB 전환은 서버 BFF에서 끝나므로,
 * 클라이언트는 선택된 와인의 `id`만 검증해 전달한다.
 */
export function buildMenuCategoryRecommendationRequest(
  wines: Wine[]
): MenuCategoryRecommendationRequest {
  const wineIds = wines
    .map((wine) => normalizeUuid(wine.id))
    .filter((id): id is string => id !== null);

  return {
    wineIds: [...new Set(wineIds)],
  };
}
