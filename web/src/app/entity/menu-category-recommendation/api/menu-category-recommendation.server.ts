import "server-only";

import { buildMysomApiUrl } from "@/app/utils/http/server-api";
import type {
  MenuCategoryRecommendationDto,
  MenuCategoryRecommendationRequest,
} from "../model/menu-category-recommendation.type";
import { mapMenuCategoryRecommendationDto } from "./menu-category-recommendation.mapper";

const MENU_CATEGORY_RECOMMEND_PATH = "/v1/wine-pairing/menu-category/recommend";
const BACKEND_TIMEOUT_MS = 30_000;

/**
 * 서버 전용 백엔드 오류.
 * Route Handler가 상태 코드만 참고해 safe message로 변환하도록 status를 담는다.
 */
export class MenuCategoryRecommendationBackendError extends Error {
  constructor(readonly status: number) {
    super(`Menu category recommendation backend responded with ${status}`);
    this.name = "MenuCategoryRecommendationBackendError";
  }
}

/**
 * 서버 전용 메뉴 카테고리 추천 helper.
 * 동기 API를 호출해 추천된 메뉴 카테고리 문자열 목록을 반환한다.
 */
export async function recommendMenuCategories(
  request: MenuCategoryRecommendationRequest
): Promise<string[]> {
  const response = await fetch(buildMysomApiUrl(MENU_CATEGORY_RECOMMEND_PATH), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
    cache: "no-store",
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new MenuCategoryRecommendationBackendError(response.status);
  }

  const dto = (await response.json()) as MenuCategoryRecommendationDto;
  return mapMenuCategoryRecommendationDto(dto);
}
