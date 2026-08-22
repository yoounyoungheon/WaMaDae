import { NextResponse } from "next/server";
import {
  MenuCategoryRecommendationBackendError,
  recommendMenuCategories,
} from "@/app/entity/menu-category-recommendation/api/menu-category-recommendation.server";
import type { MenuCategoryRecommendationRequest } from "@/app/entity/menu-category-recommendation/model/menu-category-recommendation.type";
import { normalizeUuid } from "@/app/shared/lib/validation/uuid";

const MAX_WINES = 100;

type RecommendRequestBody = {
  wineIds?: unknown;
};

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 415 }
    );
  }

  const body = (await request.json().catch(() => null)) as RecommendRequestBody | null;

  const wineIds = parseWineIds(body?.wineIds);
  if (!wineIds) {
    return NextResponse.json(
      { message: "추천할 와인을 1개 이상 선택해 주세요." },
      { status: 400 }
    );
  }

  try {
    const categories = await recommendMenuCategories({ wineIds });
    return NextResponse.json({ categories });
  } catch (error) {
    if (
      error instanceof MenuCategoryRecommendationBackendError &&
      error.status === 400
    ) {
      return NextResponse.json(
        { message: "추천할 와인 정보가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    if (
      error instanceof MenuCategoryRecommendationBackendError &&
      error.status === 404
    ) {
      return NextResponse.json(
        { message: "선택한 와인을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "추천 메뉴를 불러오지 못했습니다." },
      { status: 502 }
    );
  }
}

/**
 * `wineIds` 입력을 백엔드 계약 shape으로 검증한다.
 * 최소 1개, 각 항목은 UUID 문자열이어야 한다.
 */
function parseWineIds(
  input: unknown
): MenuCategoryRecommendationRequest["wineIds"] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_WINES) {
    return null;
  }

  const wineIds: string[] = [];

  for (const item of input) {
    const wineId = normalizeUuid(item);
    if (!wineId) {
      return null;
    }
    wineIds.push(wineId);
  }

  return [...new Set(wineIds)];
}
