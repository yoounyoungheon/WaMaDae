import { normalizeUuid } from "@/app/shared/lib/validation/uuid";
import type { MenuCategoryRecommendationRequest } from "../model/menu-category-recommendation.type";

/**
 * 선택 와인 payload를 페이지 이동/리로드 간에 유지하기 위한 sessionStorage 저장소.
 *
 * WebView는 브라우저 탭보다 리로드가 잦아 인메모리 선택만으로는 결과 화면이 쉽게 비워진다.
 * 와인 선택은 "한 세션 동안만 유효한 draft"이므로 localStorage가 아니라 sessionStorage를 쓴다.
 */
const STORAGE_KEY = "wamadae:menu-category-recommendation-request";

export function saveMenuCategoryRecommendationRequest(
  request: MenuCategoryRecommendationRequest
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(request));
  } catch {
    // sessionStorage를 쓸 수 없는 환경(사생활 모드 등)에서는 인메모리 흐름에 맡긴다.
  }
}

export function loadMenuCategoryRecommendationRequest(): MenuCategoryRecommendationRequest | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? parseStoredRequest(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function clearMenuCategoryRecommendationRequest(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시한다.
  }
}

/**
 * 저장소 값은 신뢰할 수 없으므로 shape을 다시 검증한다.
 * `wineIds`는 UUID 문자열 배열이어야 하며, 하나라도 잘못된 값이면 무효 처리한다.
 */
function parseStoredRequest(
  value: unknown
): MenuCategoryRecommendationRequest | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const { wineIds } = value as { wineIds?: unknown };
  if (!Array.isArray(wineIds) || wineIds.length === 0) {
    return null;
  }

  const parsed: string[] = [];
  for (const wineId of wineIds) {
    const normalizedWineId = normalizeUuid(wineId);
    if (!normalizedWineId) {
      return null;
    }
    parsed.push(normalizedWineId);
  }

  return { wineIds: [...new Set(parsed)] };
}
