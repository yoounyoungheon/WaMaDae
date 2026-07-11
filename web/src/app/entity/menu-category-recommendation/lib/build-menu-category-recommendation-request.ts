import type { Wine } from "@/app/entity/wine/model/wine.type";
import type { MenuCategoryRecommendationRequest } from "../model/menu-category-recommendation.type";

/**
 * 선택 와인 목록을 추천 요청 body로 변환하는 순수 함수.
 *
 * 백엔드는 각 와인의 `id`, `name`, `koreanName`이 모두 공백이 아니길 요구한다.
 * 앱 모델의 `Wine.name`은 이미 "한글명이 있으면 한글명, 없으면 원어명"으로 정규화돼 있어,
 * `koreanName`이 없을 때 원어명으로 대체하는 정책이 자연스럽게 적용된다.
 * 필수 값이 비는 와인은 요청 전체가 거절되지 않도록 제외한다.
 */
export function buildMenuCategoryRecommendationRequest(
  wines: Wine[]
): MenuCategoryRecommendationRequest {
  return {
    wines: wines
      .map((wine) => {
        const name = wine.name.trim();
        return {
          id: wine.id.trim(),
          name,
          koreanName: name,
        };
      })
      .filter((wine) => wine.id.length > 0 && wine.name.length > 0),
  };
}
