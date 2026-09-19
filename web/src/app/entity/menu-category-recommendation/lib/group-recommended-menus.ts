import type {
  MenuCategory,
  RecommendedMenu,
} from "../model/menu-category-recommendation.type";

export type RecommendedMenuGroup = {
  category: MenuCategory;
  menus: RecommendedMenu[];
};

/**
 * 추천 메뉴를 category 기준으로 그루핑한다.
 * category 순서와 각 category 내 메뉴 순서는 응답(첫 등장) 순서를 유지한다.
 */
export function groupRecommendedMenusByCategory(
  menus: RecommendedMenu[]
): RecommendedMenuGroup[] {
  const groups: RecommendedMenuGroup[] = [];
  const indexByCategory = new Map<MenuCategory, number>();

  for (const menu of menus) {
    const existingIndex = indexByCategory.get(menu.category);
    if (existingIndex === undefined) {
      indexByCategory.set(menu.category, groups.length);
      groups.push({ category: menu.category, menus: [menu] });
    } else {
      groups[existingIndex].menus.push(menu);
    }
  }

  return groups;
}
