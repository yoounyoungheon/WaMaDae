import type { MenuCategoryRecommendationRequest } from "../model/menu-category-recommendation.type";

/**
 * 선택 와인 payload를 페이지 이동/리로드 간에 유지하기 위한 sessionStorage 저장소.
 *
 * WebView는 브라우저 탭보다 리로드가 잦아 인메모리 선택만으로는 결과 화면이 쉽게 비워진다.
 * 와인 선택은 "한 세션 동안만 유효한 draft"이므로 localStorage가 아니라 sessionStorage를 쓴다.
 * (원본 와인 상세를 ID로 다시 조회하는 API가 없어 name/koreanName까지 통째로 보존한다.)
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
 * 각 와인의 `id`/`name`/`koreanName`이 공백이 아닌 문자열이 아니면 무효 처리한다.
 */
function parseStoredRequest(
  value: unknown
): MenuCategoryRecommendationRequest | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const { wines } = value as { wines?: unknown };
  if (!Array.isArray(wines) || wines.length === 0) {
    return null;
  }

  const parsed: MenuCategoryRecommendationRequest["wines"] = [];
  for (const item of wines) {
    if (typeof item !== "object" || item === null) {
      return null;
    }

    const { id, name, koreanName } = item as {
      id?: unknown;
      name?: unknown;
      koreanName?: unknown;
    };

    if (
      !isNonBlankString(id) ||
      !isNonBlankString(name) ||
      !isNonBlankString(koreanName)
    ) {
      return null;
    }

    parsed.push({ id, name, koreanName });
  }

  return { wines: parsed };
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
