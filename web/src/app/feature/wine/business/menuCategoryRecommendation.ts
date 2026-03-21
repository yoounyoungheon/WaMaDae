"use server";

import { type APIResponseType } from "@/app/utils/http";
import {
  parseServerApiError,
  requestServerApi,
} from "@/app/utils/http/server-api";

export interface MenuCategoryRecommendationWine {
  id?: number;
  name: string;
}

export interface RecommendMenuCategoriesRequest {
  wines: MenuCategoryRecommendationWine[];
}

export interface RecommendMenuCategoriesResponse {
  recommendationId: string;
  location: string;
  statusCode: 200 | 202;
}

export interface MenuCategoryRecommendationResult {
  categories: string[];
}

export interface MenuCategoryRecommendationError {
  code: string;
  message: string;
}

export type MenuCategoryRecommendationStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED";

export interface MenuCategoryRecommendationDetail {
  id: string;
  status: MenuCategoryRecommendationStatus;
  result?: MenuCategoryRecommendationResult;
  error?: MenuCategoryRecommendationError;
}

const parseRecommendationId = (location: string) => {
  const segments = location.split("/").filter(Boolean);
  return segments.at(-1) ?? "";
};

export async function recommendMenuCategoriesFromWineList(
  payload: RecommendMenuCategoriesRequest,
  idempotencyKey: string,
): Promise<APIResponseType<RecommendMenuCategoriesResponse>> {
  try {
    if (payload.wines.length === 0) {
      throw new Error("추천할 와인 목록이 필요합니다.");
    }

    const response = await requestServerApi(
      "/v1/menu-category-recommendations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      },
    );

    if (response.status !== 200 && response.status !== 202) {
      const apiErrorMessage = await parseServerApiError(response);

      throw new Error(
        apiErrorMessage ??
          "메뉴 카테고리 추천 요청에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    }

    const location = response.headers.get("Location");

    if (!location) {
      throw new Error("추천 조회 경로를 찾을 수 없습니다.");
    }

    return {
      isSuccess: true,
      isFailure: false,
      data: {
        recommendationId: parseRecommendationId(location),
        location,
        statusCode: response.status as 200 | 202,
      },
    };
  } catch (error) {
    return {
      isSuccess: false,
      isFailure: true,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "메뉴 카테고리 추천 요청에 실패했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

export async function getMenuCategoryRecommendation(
  recommendationId: string,
): Promise<APIResponseType<MenuCategoryRecommendationDetail>> {
  try {
    if (!recommendationId.trim()) {
      throw new Error("추천 조회 ID가 필요합니다.");
    }

    const response = await requestServerApi(
      `/v1/menu-category-recommendations/${recommendationId}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      const apiErrorMessage = await parseServerApiError(response);

      throw new Error(
        apiErrorMessage ??
          "메뉴 카테고리 추천 결과 조회에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    }

    const result = (await response.json()) as MenuCategoryRecommendationDetail;

    return {
      isSuccess: true,
      isFailure: false,
      data: result,
    };
  } catch (error) {
    return {
      isSuccess: false,
      isFailure: true,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "메뉴 카테고리 추천 결과 조회에 실패했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}
