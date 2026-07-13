import type { MenuCategoryRecommendationRequest } from "@/app/entity/menu-category-recommendation/model/menu-category-recommendation.type";
import type { WinePairingRequest } from "../model/wine-pairing.type";

/**
 * 메뉴 카테고리 선택 결과를 페어링 스트림 요청 body로 변환하는 순수 함수.
 *
 * - 백엔드 `wines[].id`는 정수(Long)만 허용하므로 정수 문자열 id만 통과시킨다.
 * - `menuCategories`는 공백을 제거하고 빈 값과 중복을 제외한다.
 * - 두 배열 중 하나라도 비면 요청 불가(호출부에서 버튼 비활성화로 처리).
 */
export function buildWinePairingRequest(
  wines: MenuCategoryRecommendationRequest["wines"],
  menuCategories: readonly string[]
): WinePairingRequest {
  const wineIds = wines
    .map((wine) => toIntegerWineId(wine.id))
    .filter((id): id is number => id !== null);

  const categories = [
    ...new Set(
      menuCategories
        .map((category) => category.trim())
        .filter((category) => category.length > 0)
    ),
  ];

  return {
    wines: [...new Set(wineIds)].map((id) => ({ id })),
    menuCategories: categories,
  };
}

function toIntegerWineId(id: string): number | null {
  const trimmed = id.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const numeric = Number(trimmed);
  return Number.isSafeInteger(numeric) ? numeric : null;
}
