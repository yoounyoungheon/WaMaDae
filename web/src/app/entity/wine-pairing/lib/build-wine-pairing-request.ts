import { normalizeUuid } from "@/app/shared/lib/validation/uuid";
import type { WinePairingRequest } from "../model/wine-pairing.type";

/**
 * 메뉴 카테고리 선택 결과를 페어링 스트림 요청 body로 변환하는 순수 함수.
 *
 * - 백엔드 `wineIds[]`는 UUID 문자열만 허용하므로 UUID id만 통과시킨다.
 * - `menuCategories[].name`은 공백을 제거하고 빈 값과 중복을 제외한다.
 * - 두 배열 중 하나라도 비면 요청 불가(호출부에서 버튼 비활성화로 처리).
 */
export function buildWinePairingRequest(
  wineIds: readonly string[],
  menuCategories: readonly string[]
): WinePairingRequest {
  const normalizedWineIds = wineIds
    .map((wineId) => normalizeUuid(wineId))
    .filter((wineId): wineId is string => wineId !== null);

  const categories = [
    ...new Set(
      menuCategories
        .map((category) => category.trim())
        .filter((category) => category.length > 0)
    ),
  ];

  return {
    wineIds: [...new Set(normalizedWineIds)],
    menuCategories: categories.map((name) => ({ name })),
  };
}
