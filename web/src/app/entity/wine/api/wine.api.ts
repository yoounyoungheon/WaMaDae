import { WINE_MENU_IMAGE_PART_NAME } from "../model/wine-menu-image";
import type { ExtractedWine } from "../model/wine.type";
import { mapExtractedWineDto } from "./wine.mapper";

type ExtractWineMenuResponse = {
  wines?: unknown;
};

type ErrorResponse = {
  message?: string;
};

/**
 * 브라우저 전용 와인 메뉴 추출.
 *
 * same-origin BFF(`/api/wine-pairings/extract-wine-menu`)만 호출하고,
 * 세션 UUID를 `X-Session-Id` 헤더로, 이미지들을 `wineMenuImages` multipart part로 보낸다.
 * `Content-Type`은 boundary가 필요하므로 FormData가 자동 생성하게 두고 지정하지 않는다.
 */
export async function extractWineMenu(
  sessionId: string,
  files: File[],
  signal?: AbortSignal
): Promise<ExtractedWine[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append(WINE_MENU_IMAGE_PART_NAME, file);
  }

  const response = await fetch("/api/wine-pairings/extract-wine-menu", {
    method: "POST",
    headers: { "X-Session-Id": sessionId },
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "와인 메뉴 이미지 분석에 실패했습니다.")
    );
  }

  const data = (await response.json()) as ExtractWineMenuResponse;
  const wines = Array.isArray(data.wines) ? data.wines : [];

  return wines
    .map(mapExtractedWineDto)
    .filter((wine): wine is ExtractedWine => wine !== null);
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as ErrorResponse;
    return data.message || fallback;
  } catch {
    return fallback;
  }
}
