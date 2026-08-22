import { normalizeUuid } from "@/app/shared/lib/validation/uuid";
import type { WinePairingRequest } from "../model/wine-pairing.type";

/**
 * 페어링 요청 payload를 페이지 이동/리로드 간에 유지하는 sessionStorage 저장소.
 *
 * `/wine/keywords`의 "와인 추천받기" 버튼이 저장하고 `/wine/chat`이 읽는다.
 * WebView 리로드 시에는 이 스냅샷으로 새 chatId 페어링을 다시 시작한다.
 */
const STORAGE_KEY = "wamadae:wine-pairing-request";

export function saveWinePairingRequest(request: WinePairingRequest): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(request));
  } catch {
    // sessionStorage를 쓸 수 없는 환경(사생활 모드 등)에서는 인메모리 흐름에 맡긴다.
  }
}

export function loadWinePairingRequest(): WinePairingRequest | null {
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

export function clearWinePairingRequest(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시한다.
  }
}

/** 저장소 값은 신뢰할 수 없으므로 shape을 다시 검증한다. */
function parseStoredRequest(value: unknown): WinePairingRequest | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const { wineIds, menuCategories } = value as {
    wineIds?: unknown;
    menuCategories?: unknown;
  };

  if (!Array.isArray(wineIds) || wineIds.length === 0) {
    return null;
  }
  if (!Array.isArray(menuCategories) || menuCategories.length === 0) {
    return null;
  }

  const parsedWineIds: string[] = [];
  for (const wineId of wineIds) {
    const normalizedWineId = normalizeUuid(wineId);
    if (!normalizedWineId) {
      return null;
    }
    parsedWineIds.push(normalizedWineId);
  }

  const parsedCategories: WinePairingRequest["menuCategories"] = [];
  for (const category of menuCategories) {
    if (typeof category !== "object" || category === null) {
      return null;
    }

    const { name } = category as { name?: unknown };
    if (typeof name !== "string" || name.trim().length === 0) {
      return null;
    }

    parsedCategories.push({ name: name.trim() });
  }

  return {
    wineIds: [...new Set(parsedWineIds)],
    menuCategories: dedupeCategories(parsedCategories),
  };
}

function dedupeCategories(
  categories: WinePairingRequest["menuCategories"]
): WinePairingRequest["menuCategories"] {
  const seen = new Set<string>();
  return categories.filter((category) => {
    if (seen.has(category.name)) {
      return false;
    }
    seen.add(category.name);
    return true;
  });
}
