export type WineId = string;

export type WineType = "RED" | "WHITE" | "SPARKLING";

export type Wine = {
  id: WineId;
  name: string;
  imageUrl: string;
  wineType?: WineType;
  rating: number;
  title: string;
  recommendationText: string;
  priceLabel: string;
};

export type WineSearchItem = Wine & {
  regionAndType: string;
  searchPriceLabel: string;
};

export type MenuImagePreview = {
  fileName: string;
  previewUrl?: string;
};

/**
 * API DTO 타입.
 * 서버 응답의 snake_case shape이며, mapper를 통해서만 앱 모델로 변환한다.
 * UI 타입(Wine/WineSearchItem)과 같은 타입으로 취급하지 않는다.
 */
export type WineDetailDto = {
  id: string;
  display_name: string;
  image_url?: string | null;
  wine_type?: string | null;
  wineType?: string | null;
  type?: string | null;
  rating: number;
  title: string;
  recommendation_text: string;
  price_label: string;
};

export type WineSearchItemDto = {
  id: string;
  name: string;
  region_and_type: string;
  price_label: string;
  append_wine: WineDetailDto;
};

export type WineDataType = "OCR" | "DB";

export type WineMenuOcrExtractPriceDto = {
  amount: number | string;
  currency: "KRW" | "USD" | "EUR";
  currencySign: string;
  koreanUnit: string;
};

export type WineMenuOcrExtractItemDto = {
  id: string | null;
  type: WineDataType;
  wineName: string;
  vintage: number | null;
  alcohol: number | string | null;
  price: WineMenuOcrExtractPriceDto[] | null;
  country: string | null;
  region: string | null;
};

export type WineMenuOcrExtractResponseDto = {
  wines: WineMenuOcrExtractItemDto[];
};
