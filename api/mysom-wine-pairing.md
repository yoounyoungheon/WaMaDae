# Mysom Wine Pairing API

와인 후보와 메뉴 카테고리를 기준으로 메뉴 카테고리 추천, 와인 페어링 추천, 후속 채팅을 제공한다.

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

선택한 와인과 메뉴 카테고리로 새 페어링 대화를 시작하고 추천 결과를 SSE로 반환한다.

### Request

```http
POST /v1/wine-pairing/stream/pairing
X-Chat-Id: {chatId}
Content-Type: application/json
Accept: text/event-stream
```

```ts
type PairingStreamRequest = {
  wines: PairingRequestWine[];
  menuCategories: string[];
};

type PairingRequestWine = {
  id: number | null;
  name: string | null;
};
```

Validation:

| 필드 | 제약 |
| --- | --- |
| `X-Chat-Id` | 필수, 공백 불가 |
| `wines` | 빈 배열 불가 |
| `wines[].id`, `wines[].name` | 둘 중 하나는 필요. 둘 다 있어도 유효하며 서버는 `id`를 우선 사용 |
| `menuCategories` | 빈 배열 불가 |
| `menuCategories[]` | 공백 불가 |

예시:

```json
{
  "wines": [
    { "id": 1, "name": null },
    { "id": null, "name": "내추럴 와인" }
  ],
  "menuCategories": ["스테이크", "파스타"]
}
```

`id`가 있는 와인은 내부 와인 DB에서 상세 조회한다. `name`만 있는 와인은 이름만 AI 후보로 넘기며 응답의 상세 필드 대부분이 `null`일 수 있다.

### SSE Response

Status: `200 OK`  
Content-Type: `text/event-stream`

SSE 이벤트명은 따로 지정하지 않고 기본 `data:` frame으로 내려온다.

```ts
type PairingStreamEvent =
  | {
      fieldName: "wines";
      type: "json";
      data: PairingWine;
      index: number;
    }
  | {
      fieldName: "reason" | "comment";
      type: "text";
      data: string;
      index: number;
    };

type PairingWine = {
  id: number | null;
  name: string | null;
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
```

`index`는 추천 순위다. 페어링 추천은 최대 3개까지 내려오며, 각 추천마다 다음 순서로 이벤트가 생성된다.

1. `fieldName: "wines"`, `type: "json"` - 와인 상세 JSON
2. `fieldName: "reason"`, `type: "text"` - 추천 근거 텍스트 조각들
3. `fieldName: "comment"`, `type: "text"` - 추가 설명 텍스트 조각들

`reason`, `comment`는 공백 기준으로 나뉘어 여러 이벤트로 내려올 수 있다.

예시:

```txt
data:{"fieldName":"wines","type":"json","data":{"id":1,"name":"Alpha","koreanName":"알파","area":null,"category":null,"price":null,"imagePath":null,"rating":null,"country":"France","region":null,"grape":"Merlot","vintage":null,"alcohol":null,"body":null,"sweetness":null,"tannin":null,"acidity":null},"index":1}

data:{"fieldName":"reason","type":"text","data":"진한","index":1}

data:{"fieldName":"reason","type":"text","data":"소스와","index":1}

data:{"fieldName":"comment","type":"text","data":"잘","index":1}

data:{"fieldName":"comment","type":"text","data":"어울려요","index":1}
```

### 프론트엔드 조립 규칙

- `wines` 이벤트는 `index`별 추천 카드의 기본 데이터를 채운다.
- `reason`과 `comment`는 같은 `index`끼리 이어 붙인다.
- 조각 사이 공백 복원은 프론트에서 처리해야 한다. 현재 서버는 단어 단위로 보낼 수 있다.
- 같은 `X-Chat-Id`로 페어링을 다시 시작하면 `400`이 날 수 있다.
- 스트림 시작 후 AI provider 오류가 발생하면 JSON 오류 body 없이 연결이 종료될 수 있다.

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `X-Chat-Id` 누락 또는 공백 | Spring validation 오류 응답 |
| `400 Bad Request` | request validation 실패 | `BadRequestErrorResponse` |
| `400 Bad Request` | 선택한 와인 ID를 찾을 수 없음 | `ErrorResponse`, message: `선택한 와인을 찾을 수 없습니다.` |
| `400 Bad Request` | 이미 페어링이 시작된 채팅 ID | `ErrorResponse`, message: `이미 페어링이 시작된 채팅 ID입니다.` |
| `500 Internal Server Error` | 스트림 시작 전 AI 추천 실패 | `ErrorResponse` |

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
| `X-Chat-Id` | 필수, 공백 불가 |
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
  index: number;
};
```

`index`는 0부터 시작하는 채팅 chunk 순서다.

예시:

```txt
data:{"fieldName":"chat","type":"text","data":"첫째 ","index":0}

data:{"fieldName":"chat","type":"text","data":"둘째","index":1}
```

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `X-Chat-Id` 누락 또는 공백 | Spring validation 오류 응답 |
| `400 Bad Request` | `message` 공백 | `BadRequestErrorResponse`, field: `message` |
| `400 Bad Request` | 해당 `X-Chat-Id`로 시작된 페어링 대화가 없음 | `ErrorResponse`, message: `존재하지 않는 채팅 ID입니다.` |
| `500 Internal Server Error` | 스트림 시작 전 AI 채팅 실패 | `ErrorResponse` |
