import { NextResponse } from "next/server";
import {
  MenuCategoryRecommendationBackendError,
  recommendMenuCategories,
} from "@/app/entity/menu-category-recommendation/api/menu-category-recommendation.server";
import type { MenuCategoryRecommendationRequest } from "@/app/entity/menu-category-recommendation/model/menu-category-recommendation.type";

const MAX_WINES = 100;
const MAX_FIELD_LENGTH = 200;

type RecommendRequestBody = {
  wines?: unknown;
};

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 415 }
    );
  }

  const body = (await request.json().catch(() => null)) as RecommendRequestBody | null;

  const wines = parseWines(body?.wines);
  if (!wines) {
    return NextResponse.json(
      { message: "추천할 와인을 1개 이상 선택해 주세요." },
      { status: 400 }
    );
  }

  try {
    const categories = await recommendMenuCategories({ wines });
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

    return NextResponse.json(
      { message: "추천 메뉴를 불러오지 못했습니다." },
      { status: 502 }
    );
  }
}

/**
 * `wines` 입력을 백엔드 계약 shape으로 검증한다.
 * 최소 1개, 각 항목의 `id`/`name`/`koreanName`은 공백이 아닌 문자열이어야 한다.
 */
function parseWines(
  input: unknown
): MenuCategoryRecommendationRequest["wines"] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_WINES) {
    return null;
  }

  const wines: MenuCategoryRecommendationRequest["wines"] = [];

  for (const item of input) {
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

    wines.push({ id, name, koreanName });
  }

  return wines;
}

function isNonBlankString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= MAX_FIELD_LENGTH
  );
}
