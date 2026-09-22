export type WineId = string;

export type WineCurrency = "KRW" | "USD" | "EUR";

/**
 * 백엔드 `Price` 계약.
 * `amount`는 JSON decimal number, 기호/한글 단위는 통화별 표시 문자열이다.
 */
export type WinePrice = {
  amount: number;
  currency: WineCurrency;
  currencySign: string;
  koreanUnit: string;
};

/**
 * 세션 와인 도메인 모델.
 *
 * `api/mysom-api.md`의 공통 `Wine` 계약과 동일한 camelCase shape이다.
 * - `alcohol`은 숫자가 아니라 `"12.5% ~ 13.0%"` 같은 문자열이다.
 * - 산도 필드명은 `acidity`가 아니라 `acid`다.
 * - `tannin`/`body`/`sweetness`/`acid`는 0..5 scale이며 없을 수 있다.
 */
export type Wine = {
  id: WineId;
  wineName: string;
  vintage: number | null;
  alcohol: string | null;
  price: WinePrice[] | null;
  country: string | null;
  region: string | null;
  tannin: number | null;
  body: number | null;
  sweetness: number | null;
  acid: number | null;
  wineBottleImageUrl: string | null;
};

/**
 * `POST /v1/wine-pairings/extract-wine-menu` 응답의 와인 항목.
 * 기본 `Wine`에 추출 신뢰도와 카탈로그 매칭 여부가 추가된다.
 */
export type ExtractedWine = Wine & {
  confidence: number;
  isCatalogMatched: boolean;
};

/** 선택한 메뉴 이미지 파일과 미리보기 URL(브라우저 로컬 상태). */
export type MenuImagePreview = {
  id: string;
  file: File;
  fileName: string;
  previewUrl: string;
};

/**
 * BFF가 정규화해 반환하는 추출 응답 DTO.
 * 브라우저 entity API는 이 shape을 신뢰하고 앱 모델로 매핑한다.
 */
export type WineMenuExtractResponse = {
  wines: ExtractedWine[];
};
