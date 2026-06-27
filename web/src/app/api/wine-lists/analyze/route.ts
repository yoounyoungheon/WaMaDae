import { NextResponse } from "next/server";
import { hasValidWineMenuImageSignature } from "@/app/entity/wine/api/wine-menu-image.server";
import {
  getWineMenuImageValidationMessage,
  MAX_WINE_MENU_IMAGE_SIZE,
} from "@/app/entity/wine/model/wine-menu-image";
import type {
  DetectedWineDto,
  WineDetailDto,
  WineMenuImageOcrResponseDto,
} from "@/app/entity/wine/model/wine.type";
import { buildMysomApiUrl } from "@/app/utils/http/server-api";

const OCR_WINE_MENU_PATH = "/v1/ocr/menu/wine";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data;")) {
    return NextResponse.json(
      { message: "이미지 업로드 형식이 올바르지 않습니다." },
      { status: 415 }
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_WINE_MENU_IMAGE_SIZE + 1024 * 1024
  ) {
    return NextResponse.json(
      { message: "이미지는 10MB 이하로 첨부해 주세요." },
      { status: 413 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const menuImage = formData?.get("menuImage");

  if (!(menuImage instanceof File)) {
    return NextResponse.json(
      { message: "메뉴판 이미지가 필요합니다." },
      { status: 400 }
    );
  }

  const validationMessage = getWineMenuImageValidationMessage(menuImage);
  if (validationMessage) {
    return NextResponse.json(
      { message: validationMessage },
      {
        status:
          menuImage.size > MAX_WINE_MENU_IMAGE_SIZE
            ? 413
            : menuImage.type.startsWith("image/")
            ? 400
            : 415,
      }
    );
  }

  if (!(await hasValidWineMenuImageSignature(menuImage))) {
    return NextResponse.json(
      { message: "이미지 파일의 실제 형식이 올바르지 않습니다." },
      { status: 415 }
    );
  }

  const response = await fetch(
    buildMysomApiUrl(OCR_WINE_MENU_PATH),
    {
      method: "POST",
      headers: {
        "Content-Type": menuImage.type,
        Accept: "application/json",
      },
      body: await menuImage.arrayBuffer(),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: await getSafeErrorMessage(response) },
      { status: response.status }
    );
  }

  const data = (await response.json()) as WineMenuImageOcrResponseDto;

  return NextResponse.json({
    wines: data.items.map(mapDetectedWineToWineDetailDto),
  });
}

function mapDetectedWineToWineDetailDto(
  wine: DetectedWineDto,
  index: number
): WineDetailDto {
  const description = [wine.originalName, wine.country]
    .filter(Boolean)
    .join(" · ");

  return {
    id: `ocr-wine-${index + 1}`,
    display_name: wine.name,
    image_url: "/ExampleImage.png",
    rating: 0,
    title: wine.name,
    recommendation_text: description || "OCR로 감지된 와인입니다.",
    price_label: "가격 정보 없음",
  };
}

async function getSafeErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string | null };
    return data.message || "와인 메뉴 이미지 분석에 실패했습니다.";
  } catch {
    return "와인 메뉴 이미지 분석에 실패했습니다.";
  }
}
