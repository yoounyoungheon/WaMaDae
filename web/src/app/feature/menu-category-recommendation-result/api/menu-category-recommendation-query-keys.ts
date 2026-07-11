import type { MenuCategoryRecommendationRequest } from "@/app/entity/menu-category-recommendation/model/menu-category-recommendation.type";

export const menuCategoryRecommendationQueryKeys = {
  all: ["menu-category-recommendations"] as const,
  recommend: (wines: MenuCategoryRecommendationRequest["wines"]) =>
    [...menuCategoryRecommendationQueryKeys.all, "recommend", { wines }] as const,
};
