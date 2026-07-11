import { NextResponse } from "next/server";
import { hasValidWineMenuImageSignature } from "@/app/entity/wine/api/wine-menu-image.server";
import {
  getWineMenuImageValidationMessage,
  MAX_WINE_MENU_IMAGE_SIZE,
} from "@/app/entity/wine/model/wine-menu-image";
import type {
  WineDetailDto,
  WineMenuOcrExtractItemDto,
  WineMenuOcrExtractResponseDto,
} from "@/app/entity/wine/model/wine.type";
import { buildMysomApiUrl } from "@/app/utils/http/server-api";

const OCR_WINE_MENU_PATH = "/v1/wine-pairing/wines/menu-ocr";
const BACKEND_OCR_TIMEOUT_MS = 295_000;

type DbWineMenuOcrExtractItemDto = WineMenuOcrExtractItemDto & {
  type: "DB";
  id: string;
};

export const maxDuration = 300;

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
      signal: AbortSignal.timeout(BACKEND_OCR_TIMEOUT_MS),
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: await getSafeErrorMessage(response) },
      { status: response.status }
    );
  }

  const data = (await response.json()) as WineMenuOcrExtractResponseDto;

  return NextResponse.json({
    wines: data.wines
      .filter(isDbWineMenuOcrExtractItem)
      .map(mapWineMenuOcrExtractItemToWineDetailDto),
  });
}

function isDbWineMenuOcrExtractItem(
  wine: WineMenuOcrExtractItemDto
): wine is DbWineMenuOcrExtractItemDto {
  return wine.type === "DB" && Boolean(wine.id?.trim());
}

function mapWineMenuOcrExtractItemToWineDetailDto(
  wine: DbWineMenuOcrExtractItemDto
): WineDetailDto {
  const displayName = wine.koreanName || wine.name;
  const priceLabel =
    typeof wine.price === "number"
      ? `${wine.price.toLocaleString("ko-KR")}원`
      : "가격 정보 없음";
  const description = [
    wine.name !== displayName ? wine.name : null,
    wine.country,
    "DB 와인 후보입니다.",
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    id: wine.id,
    display_name: displayName,
    image_url: "/ExampleImage.png",
    rating: 0,
    title: displayName,
    recommendation_text: description,
    price_label: priceLabel,
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
