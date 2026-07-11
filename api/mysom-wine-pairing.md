# Mysom Wine Pairing API

와인 후보와 메뉴 카테고리를 기준으로 메뉴 카테고리 추천, 와인 페어링 추천, 후속 채팅을 제공한다.

기준 코드: `mysom-api`의 `750a229`

## POST /v1/wine-pairing/menu-category/recommend

선택한 DB 와인 목록을 기준으로 어울리는 메뉴 카테고리를 즉시 추천한다.

### Request

```http
POST /v1/wine-pairing/menu-category/recommend
Content-Type: application/json
```

```ts
type MenuCategoryRecommendRequest = {
  wines: Array<{
    id: string;
    name: string;
    koreanName: string;
  }>;
};
```

Validation:

| 필드 | 제약 |
| --- | --- |
| `wines` | 빈 배열 불가 |
| `wines[].id` | 공백 불가 |
| `wines[].name` | 공백 불가 |
| `wines[].koreanName` | 공백 불가 |

예시:

```json
{
  "wines": [
    {
      "id": "wine-123",
      "name": "Chateau Margaux",
      "koreanName": "샤또 마고"
    }
  ]
}
```

### Response

Status: `200 OK`

```ts
type MenuCategoryRecommendResponse = {
  menuCategories: Array<{
    name: string;
  }>;
};
```

예시:

```json
{
  "menuCategories": [
    { "name": "Steak" },
    { "name": "Cheese" },
    { "name": "Seafood" }
  ]
}
```

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | request validation 실패 | `BadRequestErrorResponse` |
| `500 Internal Server Error` | AI 추천 연동 실패 | `ErrorResponse` |

## POST /v1/wine-pairing/stream/pairing

선택한 DB 와인과 메뉴 카테고리로 새 페어링 대화를 시작하고 추천 결과를 SSE로 반환한다.

### Request

```http
POST /v1/wine-pairing/stream/pairing
X-Chat-Id: {chatId}
Content-Type: application/json
Accept: text/event-stream
```

```ts
type PairingStreamRequest = {
  wines: Array<{
    id: number;
  }>;
  menuCategories: string[];
};
```

Validation:

| 필드 | 제약 |
| --- | --- |
| `X-Chat-Id` | 필수, 공백 불가. UUID 형식 제약은 없음 |
| `wines` | 빈 배열 불가 |
| `wines[].id` | 필수, `null` 불가. Kotlin `Long` 범위의 정수형 DB 와인 ID |
| `menuCategories` | 빈 배열 불가 |
| `menuCategories[]` | 공백 불가 |

예시:

```json
{
  "wines": [
    { "id": 1 },
    { "id": 2 }
  ],
  "menuCategories": ["스테이크", "파스타"]
}
```

이 API는 이름만 있는 와인 후보를 받지 않는다. `wines[].name`은 현재 요청 계약에 없으며, 모든 `id`를 내부 와인 DB에서 조회한 뒤 AI 추천을 시작한다.

### 처리 규칙

- 와인 조회, AI 추천, 대화 문맥 저장까지 완료한 뒤 SSE 응답을 만든다.
- 선택한 ID 중 하나라도 조회되지 않으면 스트림을 시작하지 않고 `400 Bad Request`를 반환한다.
- AI 응답의 앞 3개만 사용한 뒤 같은 와인 ID를 중복 제거하므로 최종 추천은 3개보다 적을 수 있다.
- AI가 반환한 `rank`를 다시 매기지 않고 오름차순으로 정렬해 전송하므로 rank가 반드시 `1..N`의 연속값이라고 가정하면 안 된다.

### SSE Response

Status: `200 OK`  
Content-Type: `text/event-stream`

SSE 이벤트명은 따로 지정하지 않고 기본 `data:` frame으로 내려온다. 공통 envelope에는 `index`가 없다.

```ts
type PairingStreamPayload = {
  imageUrl: string;
  rank: number;
  name: string;
  comment: string;
  reason: string;
};

type PairingStreamEvent =
  | {
      fieldName: "imageUrl";
      type: "text";
      data: string;
      status: "start";
      isStreaming: true;
    }
  | {
      fieldName: "rank";
      type: "text";
      data: string;
      status: "painting";
      isStreaming: true;
    }
  | {
      fieldName: "name" | "comment" | "reason";
      type: "text";
      data: string;
      status: "painting";
      isStreaming: true;
    }
  | {
      fieldName: "pairing";
      type: "json";
      data: PairingStreamPayload;
      status: "next";
      isStreaming: false;
    };
```

추천 한 건마다 다음 6개 frame을 순서대로 보낸다.

1. `imageUrl` / `text` / `start` / `true`
2. `rank` / `text` / `painting` / `true`
3. `name` / `text` / `painting` / `true`
4. `comment` / `text` / `painting` / `true`
5. `reason` / `text` / `painting` / `true`
6. `pairing` / `json` / `next` / `false`

필드 규칙:

| 필드 | 설명 |
| --- | --- |
| `imageUrl` | DB 와인의 `imagePath`. 값이 없으면 빈 문자열 |
| `rank` text event | 숫자를 문자열로 변환한 값 |
| `name` | 한글명이 있으면 한글명, 없으면 원어 이름 |
| `comment` | AI가 반환한 전체 추가 설명 문자열 |
| `reason` | AI가 반환한 전체 추천 근거 문자열 |
| `pairing` | 위 다섯 필드를 한 객체로 합친 현재 추천의 완성 payload. 이 안의 `rank`는 숫자 |

`comment`와 `reason`은 더 이상 단어 단위로 나뉘지 않는다.

예시:

```txt
data:{"fieldName":"imageUrl","type":"text","data":"/wines/alpha.png","status":"start","isStreaming":true}

data:{"fieldName":"rank","type":"text","data":"1","status":"painting","isStreaming":true}

data:{"fieldName":"name","type":"text","data":"알파","status":"painting","isStreaming":true}

data:{"fieldName":"comment","type":"text","data":"균형이 좋아요.","status":"painting","isStreaming":true}

data:{"fieldName":"reason","type":"text","data":"진한 소스와 잘 어울립니다.","status":"painting","isStreaming":true}

data:{"fieldName":"pairing","type":"json","data":{"imageUrl":"/wines/alpha.png","rank":1,"name":"알파","comment":"균형이 좋아요.","reason":"진한 소스와 잘 어울립니다."},"status":"next","isStreaming":false}
```

### 프론트엔드 조립 규칙

- `status: "start"`인 `imageUrl` event가 오면 현재 추천의 임시 상태를 시작한다.
- `painting` event는 `fieldName`에 해당하는 필드를 그대로 갱신한다.
- `pairing` event의 JSON을 현재 추천의 최종값으로 저장한다. 중간 text event를 다시 합쳐 최종 객체를 만들 필요는 없다.
- 추천 식별과 정렬에는 `pairing.data.rank`를 사용한다. 제거된 `index` 필드를 기대하면 안 된다.
- `isStreaming: false`는 현재 추천 하나가 완성됐다는 뜻이며, 뒤에 다음 추천 frame이 올 수 있다.
- 전체 페어링 응답 완료는 `ReadableStream`의 `done`으로 판단한다. 별도의 전체 완료 frame은 없다.

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `X-Chat-Id` 누락 또는 공백 | Spring validation 오류 응답 |
| `400 Bad Request` | `wines` 또는 `menuCategories`가 비어 있음, 와인 ID 누락, 빈 메뉴 카테고리 | `BadRequestErrorResponse` |
| `400 Bad Request` | 선택한 와인 ID를 찾을 수 없음 | `ErrorResponse`, message: `선택한 와인을 찾을 수 없습니다.` |
| `400 Bad Request` | 이미 페어링이 시작된 채팅 ID | `ErrorResponse`, message: `이미 페어링이 시작된 채팅 ID입니다.` |
| `500 Internal Server Error` | 내부 와인 조회, AI 추천 또는 AI 응답 계약 처리 실패 | `ErrorResponse` |

현재 구현에서는 와인 조회와 AI 추천이 SSE 시작 전에 끝난다. 따라서 이 단계의 실패는 JSON HTTP 오류로 반환되며, 이미 시작된 페어링 stream이 provider 오류로 중단되는 형태가 아니다.

## POST /v1/wine-pairing/stream/chat

기존 페어링 대화에 후속 질문을 보내고 답변을 SSE로 반환한다.

### Request

```http
POST /v1/wine-pairing/stream/chat
X-Chat-Id: {chatId}
Content-Type: application/json
Accept: text/event-stream
```

```ts
type WinePairingChatRequest = {
  message: string;
};
```

Validation:

| 필드 | 제약 |
| --- | --- |
| `X-Chat-Id` | 필수, 공백 불가. UUID 형식 제약은 없음 |
| `message` | 필수, 공백 불가 |

예시:

```json
{
  "message": "첫 번째 와인이 잘 어울리는 이유를 알려줘"
}
```

### SSE Response

Status: `200 OK`  
Content-Type: `text/event-stream`

```ts
type PairingChatStreamEvent = {
  fieldName: "chat";
  type: "text";
  data: string;
  status: "painting";
  isStreaming: true;
};
```

AI provider가 만든 chunk마다 한 event가 내려온다. `index`와 별도의 완료 event는 없다.

예시:

```txt
data:{"fieldName":"chat","type":"text","data":"첫째 ","status":"painting","isStreaming":true}

data:{"fieldName":"chat","type":"text","data":"둘째","status":"painting","isStreaming":true}
```

### 프론트엔드 조립 규칙

- event 수신 순서대로 `data`를 이어 붙인다.
- chunk 안의 앞뒤 공백을 제거하지 않는다. 서버가 provider chunk를 그대로 전달한다.
- `isStreaming: false` 완료 event가 오기를 기다리지 않는다. `ReadableStream`의 `done`이 응답 완료 신호다.
- stream 시작 후 AI provider 오류가 발생하면 JSON 오류 body 없이 연결이 종료될 수 있다.

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `X-Chat-Id` 누락 또는 공백 | Spring validation 오류 응답 |
| `400 Bad Request` | `message` 공백 | `BadRequestErrorResponse`, field: `message` |
| `400 Bad Request` | 해당 `X-Chat-Id`로 시작된 페어링 대화가 없음 | `ErrorResponse`, message: `존재하지 않는 채팅 ID입니다.` |
| `500 Internal Server Error` | stream 시작 전 AI 채팅 준비 실패 | `ErrorResponse` |
