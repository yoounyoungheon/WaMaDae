/**
 * `POST /v1/wine-pairing/stream/pairing` 요청 body.
 * `wines[].id`는 DB 와인의 정수 ID만 허용되고, `menuCategories`는 공백 아닌 문자열이다.
 */
export type WinePairingRequest = {
  wines: Array<{ id: number }>;
  menuCategories: string[];
};

/** `POST /v1/wine-pairing/stream/chat` 요청 body. */
export type WinePairingChatRequest = {
  message: string;
};

/** 페어링 SSE `pairing` 프레임에 포함되는 DB 와인 상세 정보. */
export type PairingStreamWine = {
  id: string;
  name: string;
  koreanName: string | null;
  area: string | null;
  category: string | null;
  price: number | null;
  imagePath: string | null;
  rating: string | null;
  country: string | null;
  region: string | null;
  grape: string | null;
  vintage: number | null;
  alcohol: number | null;
  body: number | null;
  sweetness: number | null;
  tannin: number | null;
  acidity: number | null;
};

/**
 * 페어링 스트림의 `pairing`(json) 프레임 payload.
 * 추천 한 건의 최종(권위) 데이터다.
 */
export type PairingSlidePayload = {
  imageUrl: string;
  rank: number;
  name: string;
  comment: string;
  reason: string;
  wine: PairingStreamWine;
};

/**
 * 페어링 SSE 프레임 DTO.
 * `fieldName`으로 그릴 부분을 찾고, `text`는 부분 페인팅, `json`은 전체 replace한다.
 */
export type PairingStreamEvent =
  | {
      fieldName: "imageUrl";
      type: "text";
      data: string;
      status: "start";
      isStreaming: true;
    }
  | {
      fieldName: "rank" | "name" | "comment" | "reason";
      type: "text";
      data: string;
      status: "painting";
      isStreaming: true;
    }
  | {
      fieldName: "pairing";
      type: "json";
      data: PairingSlidePayload;
      status: "next";
      isStreaming: false;
    };

/** 후속 채팅 SSE 프레임 DTO. 답변 텍스트 청크만 온다. */
export type ChatStreamEvent = {
  fieldName: "chat";
  type: "text";
  data: string;
  status: "painting";
  isStreaming: true;
};

/** 후속 채팅 스트림에서 올 수 있는 모든 SSE 프레임. 일반 답변 또는 재추천 페어링 프레임이다. */
export type PairingChatStreamEvent = ChatStreamEvent | PairingStreamEvent;
