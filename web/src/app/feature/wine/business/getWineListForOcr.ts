"use server";

import { type APIResponseType } from "@/app/utils/http";
import { API_PATH } from "@/app/utils/http/api-query";

const OCR_SUPPORTED_IMAGE_TYPES = ["image/png", "image/jpeg"] as const;

export interface OcrDetectedWine {
  name: string;
  originalName?: string;
  country?: string;
}

interface WineListForOcrResponse {
  items: OcrDetectedWine[];
  count: number;
}

interface ApiErrorResponse {
  status?: number;
  message?: string;
}

const isSupportedImageType = (
  imageType: string,
): imageType is (typeof OCR_SUPPORTED_IMAGE_TYPES)[number] =>
  OCR_SUPPORTED_IMAGE_TYPES.includes(
    imageType as (typeof OCR_SUPPORTED_IMAGE_TYPES)[number],
  );

const buildRequestUrl = () => {
  if (!API_PATH) {
    throw new Error("OCR API base URL이 설정되지 않았습니다.");
  }

  return new URL("/v1/ocr/menu/wine", API_PATH).toString();
};

const parseApiError = async (response: Response) => {
  try {
    const errorBody = (await response.json()) as ApiErrorResponse;

    if (errorBody.message) {
      return errorBody.message;
    }
  } catch {
    return null;
  }

  return null;
};

export async function getWineListForOcr(
  formData: FormData,
): Promise<APIResponseType<OcrDetectedWine[]>> {
  try {
    const imageFile = formData.get("image");

    if (!(imageFile instanceof File)) {
      throw new Error("OCR 대상 이미지가 필요합니다.");
    }

    if (!isSupportedImageType(imageFile.type)) {
      throw new Error("PNG 또는 JPEG 형식의 이미지만 업로드할 수 있습니다.");
    }

    const response = await fetch(buildRequestUrl(), {
      method: "POST",
      headers: {
        "Content-Type": imageFile.type,
      },
      body: imageFile,
      cache: "no-store",
    });

    if (!response.ok) {
      const apiErrorMessage = await parseApiError(response);

      throw new Error(
        apiErrorMessage ??
          "와인 메뉴 OCR 요청에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    }

    const result = (await response.json()) as WineListForOcrResponse;

    return {
      isSuccess: true,
      isFailure: false,
      data: result.items,
    };
  } catch (error) {
    return {
      isSuccess: false,
      isFailure: true,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "와인 메뉴 OCR 요청에 실패했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}
