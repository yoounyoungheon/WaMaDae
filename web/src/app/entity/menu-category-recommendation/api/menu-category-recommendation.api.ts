import type {
  MenuRecommendationRequest,
  RecommendedMenu,
} from "../model/menu-category-recommendation.type";

type RecommendResponse = {
  recommendedMenus?: RecommendedMenu[];
};

type ErrorResponse = {
  message?: string;
};

/**
 * 브라우저 전용 메뉴 추천 요청.
 * same-origin BFF(`/api/wine-pairings/recommend-menu`)만 호출하고
 * 세션 UUID를 `X-Session-Id` 헤더로 전달한다. BFF가 정규화한 추천 목록을 그대로 쓴다.
 */
export async function fetchMenuRecommendations(
  sessionId: string,
  request: MenuRecommendationRequest,
  signal?: AbortSignal
): Promise<RecommendedMenu[]> {
  const response = await fetch("/api/wine-pairings/recommend-menu", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "추천 메뉴를 불러오지 못했습니다.")
    );
  }

  const data = (await response.json()) as RecommendResponse;
  return Array.isArray(data.recommendedMenus) ? data.recommendedMenus : [];
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as ErrorResponse;
    return data.message || fallback;
  } catch {
    return fallback;
  }
}
