# Mysom OCR API

와인 메뉴 이미지에서 와인명을 추출하는 API다. 두 엔드포인트 모두 요청 body는 이미지 바이너리이며 `multipart/form-data`가 아니다.

## 공통 이미지 요청 규칙

허용 Content-Type:

- `image/png`
- `image/jpeg`

서버 제한:

- 이미지 body가 비어 있으면 `400 Bad Request`
- 이미지 body 합산 크기가 10MiB를 초과하면 `413 Payload Too Large`

## POST /v1/ocr/menu/wine

레거시 OCR route다. OCR로 추출한 와인 항목만 `ListResponse` 형태로 반환한다. DB 매칭 후보는 응답에 포함하지 않는다.

### Request

```http
POST /v1/ocr/menu/wine
Content-Type: image/jpeg
```

Body: 이미지 바이너리

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

필드 규칙:

| 필드 | 설명 |
| --- | --- |
| `items[].name` | 화면 표시용 와인명. 한글명이 있으면 한글명, 없으면 OCR 원문명 |
| `items[].originalName` | 한글명이 따로 있을 때의 원문명. 없으면 `null` |
| `items[].country` | OCR/AI 파싱으로 추출한 국가. 없으면 `null` |
| `count` | `items.length` |

예시:

```json
{
  "items": [
    {
      "name": "르 아모 쇼비뇽 블랑",
      "originalName": "Le Hameau Sauvignon Blanc",
      "country": "프랑스"
    }
  ],
  "count": 1
}
```

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | 이미지 body가 비어 있음 | `ErrorResponse`, message: `이미지 본문이 비어 있습니다.` |
| `413 Payload Too Large` | 이미지가 10MiB 초과 | `ErrorResponse`, message: `와인 메뉴 이미지는 10MiB 이하만 업로드할 수 있습니다.` |
| `415 Unsupported Media Type` | `Content-Type`이 `image/png`, `image/jpeg`가 아님 | Spring WebFlux 오류 응답 |
| `500 Internal Server Error` | Cloud Vision, AI 파싱, 내부 와인 검색 실패 | `ErrorResponse` 또는 Spring 오류 응답 |

## POST /v1/wine-pairing/wines/menu-ocr

와인 페어링 플로우용 OCR route다. OCR 원본 항목과 내부 DB 매칭 후보를 한 배열에 함께 반환한다.

### Request

```http
POST /v1/wine-pairing/wines/menu-ocr
Content-Type: image/png
```

Body: 이미지 바이너리

### Response

Status: `200 OK`

```ts
type WineMenuOcrExtractItem = {
  id: string | null;
  type: "OCR" | "DB";
  name: string;
  koreanName: string | null;
  country: string | null;
  price: number | null;
};

type WineMenuOcrExtractResponse = {
  wines: WineMenuOcrExtractItem[];
};
```

필드 규칙:

| 필드 | 설명 |
| --- | --- |
| `id` | `type: "DB"`인 경우 DB 와인 ID. OCR 원본 항목은 `null` |
| `type` | `OCR`은 이미지에서 추출한 원본 항목, `DB`는 내부 와인 DB 매칭 후보 |
| `name` | OCR 원문명 또는 DB 와인 원어 이름 |
| `koreanName` | 한글 와인명. 없으면 `null` |
| `country` | OCR 원본 항목에서 추출한 국가. DB 항목은 현재 `null` |
| `price` | OCR 원본 항목에서 추출한 가격. DB 항목은 현재 `null` |

예시:

```json
{
  "wines": [
    {
      "id": null,
      "type": "OCR",
      "name": "Pinot Noir",
      "koreanName": "피노 누아",
      "country": "France",
      "price": 30000
    },
    {
      "id": "1",
      "type": "DB",
      "name": "Pinot Noir",
      "koreanName": "피노 누아",
      "country": null,
      "price": null
    }
  ]
}
```

### 매칭 동작

- 서버는 OCR 텍스트를 파싱한 뒤 원어 이름과 한글 이름으로 내부 와인 검색 API를 조회한다.
- 검색은 페이지 단위로 반복 조회하며 페이지당 limit은 100이다.
- DB 후보는 와인 ID 기준으로 중복 제거되어 OCR 항목 뒤에 붙는다.
- OCR 결과가 없으면 `{ "wines": [] }`가 내려올 수 있다.

### 프론트엔드 선택 가이드

- 와인 선택 UI에서 사용자가 DB 후보를 선택했다면 이후 페어링 요청에는 `id`를 보내는 것이 좋다.
- OCR 원본만 선택했다면 이후 페어링 요청에는 `name`을 보내면 된다.
- `type: "DB"` 항목은 `country`, `price`가 현재 `null`이므로 카드 표시에는 별도 fallback이 필요하다.

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | 이미지 body가 비어 있음 | `ErrorResponse`, message: `이미지 본문이 비어 있습니다.` |
| `413 Payload Too Large` | 이미지가 10MiB 초과 | `ErrorResponse`, message: `와인 메뉴 이미지는 10MiB 이하만 업로드할 수 있습니다.` |
| `415 Unsupported Media Type` | `Content-Type`이 `image/png`, `image/jpeg`가 아님 | Spring WebFlux 오류 응답 |
| `500 Internal Server Error` | Cloud Vision, AI 파싱, 내부 와인 검색 실패 | `ErrorResponse` 또는 Spring 오류 응답 |
