# Mysom Backend API

현재 `mysom-api` Spring WebFlux 애플리케이션에 실제로 라우팅되는 API 계약이다.

## 공통

- Base URL: `http://localhost:8080`
- Base path: `/v1`
- 기본 성공 응답: `application/json`
- SSE 응답: `text/event-stream`
- 인증 방식: `Authorization: Bearer {token}`

### 공통 오류 응답

일반 오류:

```ts
type ErrorResponse = {
  status: number;
  message: string | null;
};
```

검증 오류:

```ts
type BadRequestErrorResponse = {
  status: 400;
  message: string;
  fields: Record<string, string[]>;
};
```

공통 오류 처리:

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | 요청 DTO validation 실패 | `BadRequestErrorResponse` |
| `400 Bad Request` | `ResponseStatusException(HttpStatus.BAD_REQUEST)` | `ErrorResponse` |
| `400 Bad Request` | Exposed R2DBC 요청 오류 | `ErrorResponse`, message: `잘못된 요청입니다.` |
| `403 Forbidden` | 권한 없음 | `ErrorResponse`, message: `접근 권한이 없습니다.` |
| `500 Internal Server Error` | 처리 중 런타임 오류 | `ErrorResponse`, message: `서버 오류가 발생했습니다.` |

참고:

- 인증이 필요한 API는 `/v1/upload/**`다.
- 현재 코드에는 로그인/회원가입 컨트롤러가 없다. 관련 DTO와 서비스 일부만 존재한다.
- `POST /v1/auth/logout`은 Spring Security logout matcher로 설정되어 있으나 별도 컨트롤러 API는 아니다.

## DTO

### `ListResponse<T>`

```ts
type ListResponse<T> = {
  items: T[];
  count: number;
};
```

### `ChatStreamResponse`

SSE 이벤트 1건의 JSON payload다.

```ts
type ChatStreamType = "PAIRING" | "CHAT";
type PairingChatStreamDataType = "TITLE" | "COMMENT" | "REASON";

type ChatChunkStreamResponse = {
  content: string;
};

type PairingChatStreamResponse = {
  type: PairingChatStreamDataType;
  rank: number;
  content: string;
};

type ChatStreamResponse =
  | {
      type: "CHAT";
      data: ChatChunkStreamResponse;
    }
  | {
      type: "PAIRING";
      data: PairingChatStreamResponse;
    };
```

## 파일 업로드

### 메뉴 이미지 업로드용 pre-signed URL 생성

```http
POST /v1/upload/presigned-menu-image-url
Authorization: Bearer {token}
Content-Type: application/json
```

### Request

```ts
type PresignedMenuImageUrlRequest = {
  imageType: "png" | "jpg" | "jpeg";
  restaurantId: number;
};
```

Field rules:

| 필드 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `imageType` | `string` | 예 | `png`, `jpg`, `jpeg` 중 하나 |
| `restaurantId` | `number` | 예 | `1` 이상 |

예시:

```json
{
  "imageType": "png",
  "restaurantId": 1
}
```

### Response

Status: `200 OK`

```ts
type PreSignedUrlResponse = {
  preSignedUrl: string;
  expireAt: number;
  imageFileName: string;
};
```

예시:

```json
{
  "preSignedUrl": "https://s3.r2.cloudflarestorage.com/my-bucket/my-object",
  "expireAt": 1760000000000,
  "imageFileName": "menu-image/550e8400-e29b-41d4-a716-446655440000.png"
}
```

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `imageType`이 `png`, `jpg`, `jpeg`가 아님 | `BadRequestErrorResponse` |
| `400 Bad Request` | `restaurantId < 1` | `BadRequestErrorResponse` |
| `401 Unauthorized` | 인증 토큰 없음 또는 유효하지 않음 | Spring Security 기본 인증 오류 응답 |
| `500 Internal Server Error` | R2 pre-signed URL 생성 실패 | `ErrorResponse` |

## OCR

### 와인 메뉴 이미지 OCR

```http
POST /v1/ocr/menu/wine
Content-Type: image/png
```

또는:

```http
POST /v1/ocr/menu/wine
Content-Type: image/jpeg
```

### Request

요청 body는 이미지 바이너리다.

허용 Content-Type:

- `image/png`
- `image/jpeg`

### Response

Status: `200 OK`

```ts
type DetectedWine = {
  name: string;
  originalName: string | null;
  country: string | null;
};

type WineMenuImageOcrResponse = {
  items: DetectedWine[];
  count: number;
};
```

예시:

```json
{
  "items": [
    {
      "name": "르 아모 쇼비뇽 블랑",
      "originalName": null,
      "country": null
    }
  ],
  "count": 1
}
```

현재 구현상 `originalName`, `country`는 OCR label에서 읽어도 최종 응답 변환 시 `null`로 내려간다.

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | 이미지 본문이 비어 있거나 읽을 수 없음 | `ErrorResponse` |
| `415 Unsupported Media Type` | `Content-Type`이 `image/png`, `image/jpeg`가 아님 | Spring WebFlux 기본 오류 응답 |
| `500 Internal Server Error` | Google Vision OCR 처리 실패 | `ErrorResponse` |

## 챗봇

챗봇 API는 모두 SSE(`text/event-stream`)로 응답한다.

공통 Header:

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `X-Chat-Id` | `string` | 예 | 대화를 식별하는 클라이언트 제공 ID |

### 챗봇 질문

```http
POST /v1/ai/chat/ask
X-Chat-Id: chat-1
Content-Type: application/json
Accept: text/event-stream
```

### Request

```ts
type ChatbotAskRequest = {
  chat: string;
};
```

Field rules:

| 필드 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `chat` | `string` | 예 | 공백 불가 |

예시:

```json
{
  "chat": "재밌는 농담 해줘"
}
```

### Response

Status: `200 OK`

Content-Type: `text/event-stream`

각 SSE data payload:

```json
{
  "type": "CHAT",
  "data": {
    "content": "안녕하세요!"
  }
}
```

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `chat`이 비어 있거나 공백 | `BadRequestErrorResponse` |
| `400 Bad Request` | `X-Chat-Id`가 없거나 연결되지 않은 채팅 ID | `ErrorResponse` 또는 Spring 기본 오류 응답 |
| `500 Internal Server Error` | AI 호출 또는 스트림 생성 실패 | `ErrorResponse` |

### 챗봇 와인 페어링 요청

```http
POST /v1/ai/chat/pairing
X-Chat-Id: chat-1
Content-Type: application/json
Accept: text/event-stream
```

### Request

```ts
type ChatbotWinePairingRequest = {
  wines: {
    id: number | null;
    name: string;
  }[];
  menuCategories: string[];
};
```

Field rules:

| 필드 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `wines` | `Wine[]` | 예 | 빈 배열 불가 |
| `wines[].id` | `number \| null` | 아니요 | DB 저장 와인인 경우 입력 |
| `wines[].name` | `string` | 예 | 공백 불가 |
| `menuCategories` | `string[]` | 예 | 빈 배열 불가, 각 값 공백 불가 |

예시:

```json
{
  "wines": [
    {
      "id": 1,
      "name": "샤또 마고"
    }
  ],
  "menuCategories": ["스테이크", "파스타"]
}
```

### Response

Status: `200 OK`

Content-Type: `text/event-stream`

각 SSE data payload:

```json
{
  "type": "PAIRING",
  "data": {
    "type": "TITLE",
    "rank": 1,
    "content": "샤또"
  }
}
```

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `wines`가 비어 있음 | `BadRequestErrorResponse` |
| `400 Bad Request` | `wines[].name`이 비어 있거나 공백 | `BadRequestErrorResponse` |
| `400 Bad Request` | `menuCategories`가 비어 있음 | `BadRequestErrorResponse` |
| `400 Bad Request` | `menuCategories[]` 항목이 공백 | `BadRequestErrorResponse` |
| `400 Bad Request` | 이미 페어링이 시작된 `X-Chat-Id` 재사용 | `ErrorResponse` |
| `500 Internal Server Error` | AI 호출 또는 스트림 생성 실패 | `ErrorResponse` |

## 메뉴 카테고리 추천

### 와인 목록으로 메뉴 카테고리 추천 작업 생성

```http
POST /v1/menu-category-recommendations
Idempotency-Key: 16911d74-63ab-4538-8f47-650684c40f92
Content-Type: application/json
```

### Request

```ts
type MenuCategoryRecommendRequest = {
  wines: {
    id: number | null;
    name: string;
  }[];
};
```

Header:

| 이름 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `Idempotency-Key` | `string` | 예 | UUID 문자열 |

Body:

| 필드 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `wines` | `Wine[]` | 예 | 현재 DTO validation 제약은 없음 |
| `wines[].id` | `number \| null` | 아니요 | DB 저장 와인인 경우 입력 |
| `wines[].name` | `string` | 예 | 현재 DTO validation 제약은 없음 |

예시:

```json
{
  "wines": [
    {
      "id": 1,
      "name": "Le Amo"
    }
  ]
}
```

### Response

새 추천 작업이 생성되어 비동기 처리 중:

Status: `202 Accepted`

```http
Location: /v1/menu-category-recommendations/1
```

Body 없음.

동일한 `Idempotency-Key`와 동일한 요청 본문의 작업이 이미 완료됨:

Status: `200 OK`

```http
Location: /v1/menu-category-recommendations/1
```

Body 없음.

동일한 `Idempotency-Key`와 동일한 요청 본문의 작업이 아직 처리 중이면 다시 `202 Accepted`를 반환한다.

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `Idempotency-Key`가 UUID 형식이 아님 | `ErrorResponse`, message: `Idempotency-Key must be a valid UUID.` |
| `400 Bad Request` | `Idempotency-Key` 헤더 누락 | Spring WebFlux 기본 오류 응답 |
| `409 Conflict` | 같은 `Idempotency-Key`로 다른 요청 본문을 보냄 | `ErrorResponse`, message: `Idempotency-Key already exists for a different request.` |
| `500 Internal Server Error` | 저장 또는 비동기 처리 시작 실패 | `ErrorResponse` |

### 메뉴 카테고리 추천 결과 조회

```http
GET /v1/menu-category-recommendations/{id}
```

### Request

Path parameters:

| 이름 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `id` | `string` | 예 | 숫자 문자열 |

### Response

Status: `200 OK`

```ts
type RecommendationStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";

type MenuCategoryRecommendationView = {
  id: string;
  status: RecommendationStatus;
  result: {
    categories: string[];
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
};
```

성공 완료 예시:

```json
{
  "id": "1",
  "status": "SUCCEEDED",
  "result": {
    "categories": ["white wine", "red wine"]
  },
  "error": null
}
```

처리 중 예시:

```json
{
  "id": "1",
  "status": "RUNNING",
  "result": null,
  "error": null
}
```

실패 예시:

```json
{
  "id": "1",
  "status": "FAILED",
  "result": null,
  "error": {
    "code": "RECOMMENDATION_FAILED",
    "message": "메뉴 카테고리 추천 처리에 실패했습니다."
  }
}
```

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `id`가 숫자 문자열이 아님 | `ErrorResponse`, message: `Recommendation id must be numeric.` |
| `404 Not Found` | 추천 작업을 찾을 수 없음 | `ErrorResponse`, message: `Recommendation not found.` |
| `500 Internal Server Error` | 조회 중 서버 오류 | `ErrorResponse` |

## 현재 코드에 없는 API

아래 DTO 또는 보안 설정은 존재하지만, 실제 `@RestController` 엔드포인트는 현재 코드에 없다.

- 로그인
- 회원가입
- 사용자 프로필 조회/수정
- 와인 선호도 조회/수정
- 식당 관리 API

따라서 프론트 연동 시 이 문서의 실제 라우팅 API만 호출 대상으로 본다.
