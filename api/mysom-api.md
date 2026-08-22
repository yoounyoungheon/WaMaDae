# Mysom API 명세서

이 문서는 `WaMaDae`에서 참조하는 `mysom-api` Spring WebFlux 애플리케이션의 현재 활성 HTTP 계약을 프론트엔드 관점에서 정리한다.

기준 코드: `/Users/yoon-yeongheon/dev/mysom-api`의 `134e6eb`
기준일: 2026-08-22

현재 활성 컨트롤러는 `wine-pairing` 계열 3개뿐이다. 이전 문서에 있던 `/v1/auth/logout`, `/v1/upload/presigned-menu-image-url`, `/v1/ocr/menu/wine`, `/v1/menu-category-recommendations` 계열 라우트는 현재 코드의 활성 HTTP 컨트롤러가 아니다.

## 공통

- Local Base URL: `http://localhost:8080`
- Base path: `/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- 기본 JSON 요청/응답: `application/json`
- 이미지 OCR 요청: PNG 또는 JPEG 바이너리 body
- 스트리밍 응답: `text/event-stream`

현재 `mysomm-api-app`에는 Spring Security 의존성/설정이 없어서 아래 공개 API에 애플리케이션 레벨 인증이 붙어 있지 않다. 배포 환경에서 게이트웨이 인증을 추가한다면 별도 계약으로 다뤄야 한다.

## API 목록

| 기능 | Method | Path | 인증 | 비고 |
| --- | --- | --- | --- | --- |
| 와인 메뉴 이미지 OCR | `POST` | `/v1/wine-pairing/wines/menu-ocr` | 없음 | 이미지 바이너리 body |
| 메뉴 카테고리 추천 | `POST` | `/v1/wine-pairing/menu-category/recommend` | 없음 | `wineIds` UUID 배열 기반 |
| 와인 페어링 SSE 시작 | `POST` | `/v1/wine-pairing/stream/pairing` | 없음 | `X-Chat-Id` 필수 |
| 와인 페어링 후속 채팅 SSE | `POST` | `/v1/wine-pairing/stream/chat` | 없음 | `X-Chat-Id` 필수 |

## 주요 변경점

- OCR 응답과 후속 요청은 기존 숫자형 DB wine ID가 아니라 저장된 wine snapshot UUID를 사용한다.
- 메뉴 추천과 페어링 요청 body는 `wines`가 아니라 `wineIds`를 받는다.
- 페어링 요청의 `menuCategories`는 문자열 배열이 아니라 `{ name: string }` 객체 배열이다.
- SSE envelope는 기존 `fieldName/type/status/isStreaming` 형식이 아니라 `type: "STREAM" | "JSON"` 형식이다.
- SSE 최종 JSON에는 `imageUrl`, `name`, `summary`가 없고 `pairingId`, `rank`, `wine`, `comment`, `reason`만 있다.
- 인증, 업로드 URL 발급, 로그아웃 API는 현재 활성 컨트롤러에서 제거되어 호출 대상이 아니다.

## 공통 타입

```ts
type WineId = string; // UUID

type Price = {
  amount: number | string;
  currency: "KRW" | "USD" | "EUR";
  currencySign: string;
  koreanUnit: string;
};

type Wine = {
  id: WineId | null;
  wineName: string;
  vintage: number | null;
  alcohol: number | string | null;
  price: Price[] | null;
  country: string | null;
  region: string | null;
};

type MenuCategory = {
  name: string;
};
```

`Price.currencySign`과 `Price.koreanUnit`은 서버 DTO의 계산 필드다. `currency`가 `KRW`면 각각 `₩`, `원`이고, `USD`면 `$`, `달러`, `EUR`면 `€`, `유로`다.

## 오류 응답

명시적으로 처리되는 도메인 오류는 아래 형태를 사용한다.

```ts
type ErrorResponse = {
  status: number;
  message: string | null;
};

type BadRequestErrorResponse = {
  status: 400;
  message: string;
  fields: Record<string, string[]>;
};
```

현재 코드에는 validation 오류를 `BadRequestErrorResponse`로 변환하는 전역 핸들러가 없고, 컨트롤러 OpenAPI 문서에서만 해당 스키마를 선언한다. malformed JSON, validation 실패, type mismatch는 Spring WebFlux 기본 오류 body가 내려올 수 있으므로 프론트는 status 중심으로 방어 처리한다.

명시 처리되는 오류:

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | OCR 이미지 body가 비어 있음 | `ErrorResponse`, message: `이미지 본문이 비어 있습니다.` |
| `400 Bad Request` | OCR 이미지 magic bytes가 PNG/JPEG가 아님 | `ErrorResponse`, message: `PNG 또는 JPEG 이미지만 지원합니다.` |
| `413 Payload Too Large` | OCR 이미지 body가 10MiB 초과 | `ErrorResponse`, message: `와인 메뉴 이미지는 10MiB 이하만 업로드할 수 있습니다.` |
| `404 Not Found` | 요청한 wine snapshot ID를 찾을 수 없음 | `ErrorResponse`, message: `Wine not found` |
| `404 Not Found` | 후속 채팅에 사용할 완료된 페어링이 없음 | `ErrorResponse`, message: `Pairing not found` |

## POST /v1/wine-pairing/wines/menu-ocr

와인 메뉴 이미지에서 텍스트를 OCR로 추출하고, AI가 해석한 와인 항목을 wine snapshot으로 저장한 뒤 저장된 snapshot ID와 함께 반환한다.

### Request

```http
POST /v1/wine-pairing/wines/menu-ocr
Content-Type: image/png
```

Body는 raw 이미지 바이너리다. `multipart/form-data`가 아니다. 서버는 요청 `Content-Type`보다 실제 파일 magic bytes를 기준으로 PNG/JPEG 여부를 검사한다.

### Response

```ts
type WineMenuOcrExtractResponse = {
  wines: Array<Wine & {
    id: WineId;
    type: "OCR" | "DB";
  }>;
};
```

현재 `WineMenuOcrService` 흐름은 OCR+AI 해석 결과를 새 snapshot으로 저장하고, 응답 `type`은 `OCR`로 매핑한다. DTO enum에는 `DB`도 남아 있지만 현재 매퍼는 `DB` 항목을 생성하지 않는다.

예시:

```json
{
  "wines": [
    {
      "id": "e501190d-ad82-460a-9d3d-b78999d49841",
      "type": "OCR",
      "wineName": "Cloudy Bay Sauvignon Blanc",
      "vintage": 2023,
      "alcohol": 13.5,
      "price": [
        {
          "amount": 55000,
          "currency": "KRW",
          "currencySign": "₩",
          "koreanUnit": "원"
        }
      ],
      "country": "New Zealand",
      "region": "Marlborough"
    }
  ]
}
```

OCR 응답의 `id`를 이후 `wineIds`에 그대로 사용한다.

## POST /v1/wine-pairing/menu-category/recommend

선택한 wine snapshot 목록을 기준으로 어울리는 메뉴 카테고리를 추천한다.

### Request

```http
POST /v1/wine-pairing/menu-category/recommend
Content-Type: application/json
```

```ts
type MenuCategoryRecommendationRequest = {
  wineIds: WineId[];
};
```

Validation:

| 필드 | 제약 |
| --- | --- |
| `wineIds` | 빈 배열 불가 |
| `wineIds[]` | UUID 문자열 |

예시:

```json
{
  "wineIds": ["e501190d-ad82-460a-9d3d-b78999d49841"]
}
```

### Response

```ts
type MenuCategoryRecommendationResponse = {
  menuCategories: MenuCategory[];
};
```

예시:

```json
{
  "menuCategories": [
    { "name": "해산물" },
    { "name": "샐러드" }
  ]
}
```

## POST /v1/wine-pairing/stream/pairing

선택한 wine snapshot과 메뉴 카테고리로 새 페어링을 시작하고, 와인별 필드 청크와 완성 JSON을 SSE로 반환한다.

### Request

```http
POST /v1/wine-pairing/stream/pairing
X-Chat-Id: {chatId}
Content-Type: application/json
Accept: text/event-stream
```

```ts
type WinePairingRequest = {
  wineIds: WineId[];
  menuCategories: MenuCategory[];
};
```

Validation:

| 필드 | 제약 |
| --- | --- |
| `X-Chat-Id` | 필수, 공백 불가. UUID 형식 강제는 없음 |
| `wineIds` | 빈 배열 불가 |
| `wineIds[]` | UUID 문자열 |
| `menuCategories` | 빈 배열 불가 |
| `menuCategories[].name` | 문자열 |

예시:

```json
{
  "wineIds": [
    "e501190d-ad82-460a-9d3d-b78999d49841",
    "b9753122-8efa-4191-8df7-a0643a3a4caf"
  ],
  "menuCategories": [
    { "name": "해산물" },
    { "name": "샐러드" }
  ]
}
```

## POST /v1/wine-pairing/stream/chat

기존 `X-Chat-Id`의 최신 완료 페어링을 문맥으로 후속 메시지를 처리한다. 서버 라우팅 결과에 따라 일반 채팅 청크 또는 재페어링 스트림이 내려올 수 있다.

### Request

```http
POST /v1/wine-pairing/stream/chat
X-Chat-Id: {chatId}
Content-Type: application/json
Accept: text/event-stream
```

```ts
type WinePairingConversationRequest = {
  message: string;
};
```

Validation:

| 필드 | 제약 |
| --- | --- |
| `X-Chat-Id` | 필수, 공백 불가 |
| `message` | 필수, 공백 불가 |

예시:

```json
{
  "message": "첫 번째 와인을 더 가벼운 스타일로 다시 추천해줘"
}
```

## SSE 응답 타입

`/v1/wine-pairing/stream/pairing`과 `/v1/wine-pairing/stream/chat`은 SSE `data:` payload에 아래 JSON을 담아 보낸다.

```ts
type StreamResponse = StreamChunkResponse | StreamJsonResponse;

type StreamChunkResponse = {
  type: "STREAM";
  data: JsonFieldStreamData | ChatStreamData;
};

type StreamJsonResponse = {
  type: "JSON";
  data: PairingStreamData;
};

type JsonFieldStreamData = {
  fieldName: "rank" | "name" | "comment" | "reason";
  hasNext: boolean;
  body: string;
};

type ChatStreamData = {
  body: string;
};

type PairingStreamData = {
  pairingId: string;
  rank: number;
  wine: Wine;
  comment: string;
  reason: string;
};
```

페어링/재페어링 스트림은 추천 와인 한 건마다 다음 순서로 내려온다.

1. `STREAM` `data.fieldName: "rank"` 청크들
2. `STREAM` `data.fieldName: "name"` 청크들
3. `STREAM` `data.fieldName: "comment"` 청크들
4. `STREAM` `data.fieldName: "reason"` 청크들
5. `JSON` 완성 페어링 payload

`JsonFieldStreamData.hasNext`는 같은 `fieldName`의 다음 청크가 있는지만 뜻한다. 다음 필드나 다음 추천 와인의 존재 여부는 전체 stream 진행으로 판단한다.

페어링 SSE 예시:

```txt
data:{"type":"STREAM","data":{"fieldName":"rank","hasNext":false,"body":"1"}}

data:{"type":"STREAM","data":{"fieldName":"name","hasNext":false,"body":"Cloudy Bay Sauvignon Blanc"}}

data:{"type":"STREAM","data":{"fieldName":"comment","hasNext":false,"body":"차갑게 드세요"}}

data:{"type":"STREAM","data":{"fieldName":"reason","hasNext":false,"body":"상큼한 조화"}}

data:{"type":"JSON","data":{"pairingId":"e501190d-ad82-460a-9d3d-b78999d49841","rank":1,"wine":{"id":"e501190d-ad82-460a-9d3d-b78999d49841","wineName":"Cloudy Bay Sauvignon Blanc","vintage":2023,"alcohol":13.5,"price":[{"amount":55000,"currency":"KRW","currencySign":"₩","koreanUnit":"원"}],"country":"New Zealand","region":"Marlborough"},"comment":"차갑게 드세요","reason":"상큼한 조화"}}
```

일반 후속 채팅은 `fieldName`과 `hasNext`가 없는 `STREAM` 청크만 내려오고 별도 완료 frame은 없다.

```txt
data:{"type":"STREAM","data":{"body":"산미가 "}}

data:{"type":"STREAM","data":{"body":"잘 어울립니다."}}
```

## 프론트엔드 구현 메모

- `POST` SSE는 `EventSource`를 사용할 수 없으므로 `fetch` + `ReadableStream`으로 `data:` line을 파싱한다.
- OCR 결과의 `wines[].id`는 저장된 wine snapshot UUID다. 메뉴 추천과 페어링 요청의 `wineIds`에 그대로 사용한다.
- `wineIds`는 중복 없이 보내는 것이 안전하다. 중복 ID는 현재 전용 오류 응답으로 정리되어 있지 않다.
- `menuCategories`는 문자열 배열이 아니라 `{ name }` 객체 배열로 보낸다.
- `/stream/pairing`에서 사용한 `X-Chat-Id`를 `/stream/chat`에도 같은 값으로 보내야 페어링 이력을 이어갈 수 있다.
- `STREAM` payload에 `fieldName`이 있으면 필드 스트리밍, 없으면 일반 채팅 텍스트로 처리한다.
- 페어링 UI의 최종 카드는 `type: "JSON"` payload를 기준으로 확정한다. 중간 `STREAM` 청크는 진행 표시용으로만 써도 된다.
- 전체 완료는 HTTP stream 종료로 판단한다. 현재 계약에는 전체 완료 전용 frame이 없다.
- 기존 `fieldName/type/status/isStreaming` envelope, `imageUrl`, top-level `name`, top-level `summary`, 숫자형 `wines[].id`에 의존한 코드는 현재 API와 맞지 않는다.
