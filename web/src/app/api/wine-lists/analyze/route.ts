import { NextResponse } from "next/server";
import { getWineDataType } from "@/app/entity/wine/api/wine-data-type.server";
import { hasValidWineMenuImageSignature } from "@/app/entity/wine/api/wine-menu-image.server";
import {
  getWineMenuImageValidationMessage,
  MAX_WINE_MENU_IMAGE_SIZE,
} from "@/app/entity/wine/model/wine-menu-image";
import type {
  WineDataType,
  WineDetailDto,
  WineMenuOcrExtractItemDto,
  WineMenuOcrExtractPriceDto,
  WineMenuOcrExtractResponseDto,
} from "@/app/entity/wine/model/wine.type";
import { isUuidString } from "@/app/shared/lib/validation/uuid";
import { buildMysomApiUrl } from "@/app/utils/http/server-api";

const OCR_WINE_MENU_PATH = "/v1/wine-pairing/wines/menu-ocr";
const BACKEND_OCR_TIMEOUT_MS = 295_000;

type SelectedWineMenuOcrExtractItemDto = WineMenuOcrExtractItemDto & {
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

  let wineDataType: WineDataType;
  try {
    wineDataType = getWineDataType();
  } catch {
    return NextResponse.json(
      { message: "와인 데이터 타입 설정이 올바르지 않습니다." },
      { status: 500 }
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
  const wines = Array.isArray(data.wines) ? data.wines : [];

  return NextResponse.json({
    wines: wines
      .filter((wine): wine is SelectedWineMenuOcrExtractItemDto =>
        isSelectedWineMenuOcrExtractItem(wine, wineDataType)
      )
      .map(mapWineMenuOcrExtractItemToWineDetailDto),
  });
}

function isSelectedWineMenuOcrExtractItem(
  wine: WineMenuOcrExtractItemDto,
  wineDataType: WineDataType
): wine is SelectedWineMenuOcrExtractItemDto {
  return (
    wine.type === wineDataType &&
    isUuidString(wine.id) &&
    typeof wine.wineName === "string" &&
    wine.wineName.trim().length > 0
  );
}

function mapWineMenuOcrExtractItemToWineDetailDto(
  wine: SelectedWineMenuOcrExtractItemDto
): WineDetailDto {
  const displayName = wine.wineName.trim();
  const description = [
    wine.country,
    wine.region,
    wine.vintage != null ? `${wine.vintage} 빈티지` : null,
    formatAlcohol(wine.alcohol),
    `${wine.type} 와인 후보입니다.`,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    id: wine.id.trim(),
    display_name: displayName,
    image_url: "/ExampleImage.png",
    rating: 0,
    title: displayName,
    recommendation_text: description,
    price_label: formatPriceLabel(wine.price),
  };
}

function formatPriceLabel(
  prices: WineMenuOcrExtractPriceDto[] | null
): string {
  const price = prices?.find((item) => {
    const amount = String(item.amount).trim();
    return amount.length > 0;
  });

  if (!price) {
    return "가격 정보 없음";
  }

  const amountLabel =
    typeof price.amount === "number"
      ? price.amount.toLocaleString(price.currency === "KRW" ? "ko-KR" : "en-US")
      : price.amount.trim();

  if (price.currency === "KRW") {
    return `${amountLabel}${price.koreanUnit || "원"}`;
  }

  return `${price.currencySign || price.currency}${amountLabel}`;
}

function formatAlcohol(alcohol: number | string | null): string | null {
  if (alcohol == null) {
    return null;
  }

  const label =
    typeof alcohol === "number" ? alcohol.toLocaleString("ko-KR") : alcohol.trim();

  if (label.length === 0) {
    return null;
  }

  return label.endsWith("%") ? `알코올 ${label}` : `알코올 ${label}%`;
}

async function getSafeErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string | null };
    return data.message || "와인 메뉴 이미지 분석에 실패했습니다.";
  } catch {
    return "와인 메뉴 이미지 분석에 실패했습니다.";
  }
}
