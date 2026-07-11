import type { MenuCategoryRecommendationDto } from "../model/menu-category-recommendation.type";

/**
 * 백엔드 추천 응답 DTO를 메뉴 카테고리 문자열 목록으로 변환한다.
 * 공백이거나 문자열이 아닌 항목은 걸러내고 응답 순서를 유지한다.
 */
export function mapMenuCategoryRecommendationDto(
  dto: MenuCategoryRecommendationDto
): string[] {
  if (!dto || !Array.isArray(dto.menuCategories)) {
    throw new Error("Invalid menu category recommendation response");
  }

  return dto.menuCategories
    .map((category) => category?.name)
    .filter(
      (name): name is string => typeof name === "string" && name.trim().length > 0
    );
}
