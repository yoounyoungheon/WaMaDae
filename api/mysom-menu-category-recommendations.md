# Mysom Menu Category Recommendations API

와인 목록 기반 메뉴 카테고리 추천을 비동기로 생성하고 조회하는 API다. 즉시 응답이 필요한 화면은 [mysom-wine-pairing.md](./mysom-wine-pairing.md)의 `/v1/wine-pairing/menu-category/recommend`를 참고한다.

## POST /v1/menu-category-recommendations

추천 작업을 생성하거나 기존 멱등 요청을 재사용한다. 응답 body는 없고 `Location` 헤더로 조회 URL을 반환한다.

### Request

```http
POST /v1/menu-category-recommendations
Idempotency-Key: {uuid}
Content-Type: application/json
```

```ts
type CreateMenuCategoryRecommendationRequest = {
  wines: Array<{
    id: number | null;
    name: string;
  }>;
};
```

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

### Header rules

| 헤더 | 필수 | 제약 |
| --- | --- | --- |
| `Idempotency-Key` | 예 | UUID 문자열 |

같은 `Idempotency-Key`와 같은 요청 body를 다시 보내면 기존 추천 작업을 재사용한다. 같은 key로 다른 body를 보내면 `409 Conflict`가 발생한다.

### Body rules

현재 DTO에는 bean validation이 없다. 프론트에서는 안정적으로 최소 1개 이상의 와인을 보내는 것을 권장한다.

| 필드 | 설명 |
| --- | --- |
| `wines[].id` | DB에 존재하는 와인이면 ID를 보낸다. 이름만 있는 후보면 `null` 가능 |
| `wines[].name` | 추천 기준으로 사용할 와인명 |

### Response

Status는 작업 상태에 따라 달라진다.

| Status | 조건 | Body | Header |
| --- | --- | --- | --- |
| `202 Accepted` | 새 작업 생성 또는 기존 작업이 `PENDING`/`RUNNING` | 없음 | `Location: /v1/menu-category-recommendations/{id}` |
| `200 OK` | 같은 요청의 기존 작업이 `SUCCEEDED`/`FAILED` | 없음 | `Location: /v1/menu-category-recommendations/{id}` |

예시:

```http
HTTP/1.1 202 Accepted
Location: /v1/menu-category-recommendations/1
```

### 프론트엔드 처리

1. UUID를 생성해 `Idempotency-Key`로 보낸다.
2. `Location` 헤더를 읽어 조회 URL을 저장한다.
3. `GET {Location}`을 polling한다.
4. `status`가 `SUCCEEDED`면 `result.categories`를 사용한다.
5. `status`가 `FAILED`면 `error.message`를 표시하거나 fallback을 사용한다.

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `Idempotency-Key`가 UUID가 아님 | `ErrorResponse`, message: `Idempotency-Key must be a valid UUID.` |
| `409 Conflict` | 같은 key로 다른 request body 전송 | `ErrorResponse`, message: `Idempotency-Key already exists for a different request.` |
| `500 Internal Server Error` | DB 저장 실패 등 서버 오류 | `ErrorResponse` |

## GET /v1/menu-category-recommendations/{id}

추천 작업의 현재 상태와 결과를 조회한다.

### Request

```http
GET /v1/menu-category-recommendations/{id}
```

Path parameter:

| 이름 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `id` | `string` | 예 | 숫자로 변환 가능해야 함 |

### Response

Status: `200 OK`

```ts
type MenuCategoryRecommendationStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED";

type MenuCategoryRecommendationView = {
  id: string;
  status: MenuCategoryRecommendationStatus;
  result: MenuCategoryRecommendationResult | null;
  error: MenuCategoryRecommendationError | null;
};

type MenuCategoryRecommendationResult = {
  categories: string[];
};

type MenuCategoryRecommendationError = {
  code: string;
  message: string;
};
```

상태별 필드 규칙:

| status | result | error |
| --- | --- | --- |
| `PENDING` | `null` | `null` |
| `RUNNING` | `null` | `null` |
| `SUCCEEDED` | `{ categories: string[] }` | `null` |
| `FAILED` | `null` | `{ code: "RECOMMENDATION_FAILED", message: "메뉴 카테고리 추천 처리에 실패했습니다." }` |

성공 예시:

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
| `400 Bad Request` | `id`가 숫자가 아님 | `ErrorResponse`, message: `Recommendation id must be numeric.` |
| `404 Not Found` | 해당 추천 작업 없음 | `ErrorResponse`, message: `Recommendation not found.` |
| `500 Internal Server Error` | DB 조회 실패 등 서버 오류 | `ErrorResponse` |
