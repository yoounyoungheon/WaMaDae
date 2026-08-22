/**
 * `POST /v1/wine-pairing/stream/pairing` 요청 body.
 * `wineIds`는 와인 UUID 문자열이고, `menuCategories[].name`은 공백 아닌 문자열이다.
 */
export type WinePairingRequest = {
  wineIds: string[];
  menuCategories: Array<{ name: string }>;
};

/** `POST /v1/wine-pairing/stream/chat` 요청 body. */
export type WinePairingChatRequest = {
  message: string;
};

export type PairingStreamWinePrice = {
  amount: number | string;
  currency: "KRW" | "USD" | "EUR";
  currencySign: string;
  koreanUnit: string;
};

/** 페어링 SSE `JSON` 프레임에 포함되는 와인 상세 정보. */
export type PairingStreamWine = {
  id: string | null;
  wineName: string;
  vintage: number | null;
  alcohol: number | string | null;
  price: PairingStreamWinePrice[] | null;
  country: string | null;
  region: string | null;
};

/**
 * 페어링 스트림의 `JSON` 프레임 payload.
 * 추천 한 건의 최종(권위) 데이터다.
 */
export type PairingSlidePayload = {
  pairingId: string;
  rank: number;
  wine: PairingStreamWine;
  comment: string;
  reason: string;
};

export type PairingFieldName = "rank" | "name" | "comment" | "reason";

export type PairingFieldStreamData = {
  fieldName: PairingFieldName;
  hasNext: boolean;
  body: string;
};

export type ChatStreamData = {
  body: string;
};

/**
 * 페어링 SSE 프레임 DTO.
 * `STREAM`은 필드 청크, `JSON`은 추천 한 건의 최종 payload다.
 */
export type PairingStreamEvent =
  | {
      type: "STREAM";
      data: PairingFieldStreamData;
    }
  | {
      type: "JSON";
      data: PairingSlidePayload;
    };

/** 후속 채팅 SSE 프레임 DTO. 답변 텍스트 청크만 온다. */
export type ChatStreamEvent = {
  type: "STREAM";
  data: ChatStreamData;
};

/** 후속 채팅 스트림에서 올 수 있는 모든 SSE 프레임. 일반 답변 또는 재추천 페어링 프레임이다. */
export type PairingChatStreamEvent = ChatStreamEvent | PairingStreamEvent;
