import type { MenuCategoryRecommendationRequest } from "@/app/entity/menu-category-recommendation/model/menu-category-recommendation.type";

export const menuCategoryRecommendationQueryKeys = {
  all: ["menu-category-recommendations"] as const,
  recommend: (wineIds: MenuCategoryRecommendationRequest["wineIds"]) =>
    [...menuCategoryRecommendationQueryKeys.all, "recommend", { wineIds }] as const,
};
