# 와인 리스트 선택 BFF API

이 문서는 `/wine/ai` 와인 리스트 선택 화면에서 브라우저가 호출하는 Next.js BFF
계약이다. 실제 백엔드 API 계약은 `api/mysom-api.md`를 기준으로 하며, 브라우저는
백엔드 `/v1/*`를 직접 호출하지 않는다.

## 공통

- BFF Base path: `/api`
- 실제 Backend Base URL 기본값: `http://localhost:8080`
- 실제 Backend Base path: `/v1`
- 인증: OCR과 검색은 없음, 업로드 pre-signed URL 생성은 `Authorization: Bearer {token}` 필요
- BFF 오류 응답:

```ts
type BffErrorResponse = {
  message: string;
};
```

## DTO

### 실제 OCR 응답 DTO

`POST /v1/ocr/menu/wine`의 실제 백엔드 응답이다.

```ts
type DetectedWineDto = {
  name: string;
  originalName: string | null;
  country: string | null;
};

type WineMenuImageOcrResponseDto = {
  items: DetectedWineDto[];
  count: number;
};
```

### 화면 호환용 BFF 와인 카드 DTO

현재 `/wine/ai` UI는 선택 카드 렌더링에 이미지, 별점, 가격 필드를 기대한다. 실제 OCR
응답에는 해당 값이 없으므로 BFF가 fallback 값을 넣어 기존 카드 DTO로 변환한다.

```ts
type WineDetailDto = {
  id: string;
  display_name: string;
  image_url: string;
  rating: number;
  title: string;
  recommendation_text: string;
  price_label: string;
};
```

Fallback 규칙:

- `id`: `ocr-wine-{index}`
- `display_name`: OCR `name`
- `title`: OCR `name`
- `image_url`: `/ExampleImage.png`
- `rating`: `0`
- `recommendation_text`: `originalName · country`, 값이 없으면 `OCR로 감지된 와인입니다.`
- `price_label`: `가격 정보 없음`

## 와인 검색

### Endpoint

```http
GET /api/wines/search
```

현재 실제 `mysom-api`에는 와인 이름 검색 API가 없다. 따라서 이 BFF endpoint는 검색어
validation만 수행하고 항상 빈 배열을 반환한다.

### Query parameters

| 이름 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `q` | `string` | 아니요 | 앞뒤 공백 제거 후 최대 100자 |

### Response

Status: `200 OK`

```ts
type SearchWinesResponse = {
  wines: [];
};
```

예시:

```json
{
  "wines": []
}
```

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `q`가 100자를 초과함 | `{ "message": "검색어는 100자 이하로 입력해 주세요." }` |

## 메뉴 이미지 OCR 분석

### BFF Endpoint

```http
POST /api/wine-lists/analyze
Content-Type: multipart/form-data
```

### BFF Request

FormData:

| 이름 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `menuImage` | `File` | 예 | 최대 10MB, `image/png` 또는 `image/jpeg` |

허용 MIME type:

- `image/png`
- `image/jpeg`

### Backend Mapping

BFF는 `menuImage` 파일을 검증한 뒤 실제 백엔드 OCR API로 이미지 바이너리를 전달한다.

```http
POST /v1/ocr/menu/wine
Content-Type: image/png
```

또는:

```http
POST /v1/ocr/menu/wine
Content-Type: image/jpeg
```

요청 body는 이미지 바이너리다.

### BFF Response

Status: `200 OK`

```ts
type AnalyzeWineListResponse = {
  wines: WineDetailDto[];
};
```

예시:

```json
{
  "wines": [
    {
      "id": "ocr-wine-1",
      "display_name": "르 아모 쇼비뇽 블랑",
      "image_url": "/ExampleImage.png",
      "rating": 0,
      "title": "르 아모 쇼비뇽 블랑",
      "recommendation_text": "OCR로 감지된 와인입니다.",
      "price_label": "가격 정보 없음"
    }
  ]
}
```

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `menuImage`가 없음 | `{ "message": "메뉴판 이미지가 필요합니다." }` |
| `400 Bad Request` | 파일 크기가 0바이트임 | `{ "message": "비어 있는 파일은 첨부할 수 없습니다." }` |
| `413 Content Too Large` | 파일이 10MB를 초과함 | `{ "message": "이미지는 10MB 이하로 첨부해 주세요." }` |
| `413 Content Too Large` | 전체 요청이 11MB를 초과함 | `{ "message": "이미지는 10MB 이하로 첨부해 주세요." }` |
| `415 Unsupported Media Type` | 요청이 `multipart/form-data`가 아님 | `{ "message": "이미지 업로드 형식이 올바르지 않습니다." }` |
| `415 Unsupported Media Type` | 허용되지 않은 MIME type | `{ "message": "JPG, PNG 이미지만 첨부할 수 있습니다." }` |
| `415 Unsupported Media Type` | 파일 signature가 MIME type과 일치하지 않음 | `{ "message": "이미지 파일의 실제 형식이 올바르지 않습니다." }` |
| `500 Internal Server Error` | 백엔드 OCR 처리 실패 | `{ "message": string }` |

## 메뉴 이미지 업로드 pre-signed URL 생성

### BFF Endpoint

```http
POST /api/upload/presigned-menu-image-url
Authorization: Bearer {token}
Content-Type: application/json
```

### BFF Request

```ts
type PresignedMenuImageUrlRequest = {
  imageType: "png" | "jpg" | "jpeg";
  restaurantId: number;
};
```

### Backend Mapping

```http
POST /v1/upload/presigned-menu-image-url
Authorization: Bearer {token}
Content-Type: application/json
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

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | 요청 DTO validation 실패 | `{ "message": "업로드 URL 요청 형식이 올바르지 않습니다." }` |
| `401 Unauthorized` | `Authorization` 헤더 없음 | `{ "message": "인증 정보가 필요합니다." }` |
| `401 Unauthorized` | 백엔드 인증 실패 | 백엔드 오류를 안전 메시지로 변환 |
| `500 Internal Server Error` | 업로드 URL 생성 실패 | `{ "message": string }` |
