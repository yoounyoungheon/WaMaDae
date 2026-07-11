import type { MenuCategoryRecommendationRequest } from "../model/menu-category-recommendation.type";

type RecommendResponse = {
  categories: string[];
};

type ErrorResponse = {
  message?: string;
};

/**
 * 브라우저 전용 메뉴 카테고리 추천 요청.
 * same-origin BFF만 호출하고, BFF가 정규화한 categories 배열을 그대로 사용한다.
 */
export async function fetchMenuCategoryRecommendations(
  request: MenuCategoryRecommendationRequest,
  signal?: AbortSignal
): Promise<string[]> {
  const response = await fetch("/api/wine-pairing/menu-category/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "추천 메뉴를 불러오지 못했습니다.")
    );
  }

  const data = (await response.json()) as RecommendResponse;
  return data.categories;
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as ErrorResponse;
    return data.message || fallback;
  } catch {
    return fallback;
  }
}
