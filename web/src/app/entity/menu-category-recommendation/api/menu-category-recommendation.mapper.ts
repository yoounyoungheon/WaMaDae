import {
  MENU_CATEGORIES,
  type MenuCategory,
  type MenuRecommendationResponseDto,
  type RecommendedMenu,
} from "../model/menu-category-recommendation.type";

const menuCategorySet: ReadonlySet<string> = new Set(MENU_CATEGORIES);

function isMenuCategory(value: unknown): value is MenuCategory {
  return typeof value === "string" && menuCategorySet.has(value);
}

/**
 * 백엔드 추천 응답 DTO를 앱 모델(RecommendedMenu[])로 변환한다.
 *
 * - 응답 순서(AI rank 순)를 그대로 유지한다.
 * - `name`은 다음 pairing의 허용 목록이므로 trim만 하고 변형하지 않는다.
 * - 알 수 없는 category는 다른 값으로 바꾸지 않고 계약 오류로 던진다.
 */
export function mapMenuRecommendationDto(
  dto: MenuRecommendationResponseDto
): RecommendedMenu[] {
  if (!dto || !Array.isArray(dto.recommendedMenus)) {
    throw new Error("Invalid menu recommendation response");
  }

  return dto.recommendedMenus.map((menu) => {
    const name = typeof menu?.name === "string" ? menu.name.trim() : "";
    if (name.length === 0) {
      throw new Error("Invalid menu recommendation name");
    }
    if (!isMenuCategory(menu?.category)) {
      throw new Error(`Unknown menu category: ${String(menu?.category)}`);
    }
    return { name, category: menu.category };
  });
}
