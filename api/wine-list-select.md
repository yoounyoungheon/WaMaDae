# 와인 검색 및 메뉴 이미지 분석 API

## 공통

- Base path: `/api`
- 인증: 없음
- 성공 응답: `application/json`
- 오류 응답:

```json
{
  "message": "오류 메시지"
}
```

## DTO

### `WineDetailDto`

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

### `WineSearchItemDto`

```ts
type WineSearchItemDto = {
  id: string;
  name: string;
  region_and_type: string;
  price_label: string;
  append_wine: WineDetailDto;
};
```

## 와인 검색

### Endpoint

```http
GET /api/wines/search
```

### Query parameters

| 이름 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `q` | `string` | 아니요 | 앞뒤 공백 제거 후 최대 100자 |

### 성공 응답

Status: `200 OK`

```json
{
  "wines": [
    {
      "id": "wine-search-1",
      "name": "와인 이름 1",
      "region_and_type": "프랑스, 보르도",
      "price_label": "25,000원",
      "append_wine": {
        "id": "wine-search-1",
        "display_name": "와인 이름 1",
        "image_url": "/ExampleImage.png",
        "rating": 4.3,
        "title": "몬테스 알파 카베르네 소비뇽 2021",
        "recommendation_text": "진한 풍미를 원한다면 추천",
        "price_label": "35,000원"
      }
    }
  ]
}
```

```ts
type SearchWinesResponse = {
  wines: WineSearchItemDto[];
};
```

`q`가 없거나 공백 제거 후 빈 문자열이면 다음 응답을 반환한다.

```json
{
  "wines": []
}
```

검색은 `name`, `region_and_type`, `append_wine.title`을 대상으로 대소문자를
구분하지 않는 부분 문자열 검색을 수행한다.

### 오류 응답

| Status | 조건 | 메시지 |
| --- | --- | --- |
| `400 Bad Request` | `q`가 100자를 초과함 | `검색어는 100자 이하로 입력해 주세요.` |

## 메뉴 이미지 분석

### Endpoint

```http
POST /api/wine-lists/analyze
Content-Type: multipart/form-data
```

### FormData

| 이름 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `menuImage` | `File` | 예 | 최대 10MB, 허용된 이미지 형식만 가능 |

허용 MIME type:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/heic`
- `image/heif`

서버는 MIME type과 실제 파일 signature를 모두 검증한다.

전체 multipart 요청의 `content-length`가 11MB를 초과하면 body를 파싱하기
전에 요청을 거부한다.

### 성공 응답

Status: `200 OK`

현재 응답은 SSE가 아닌 JSON이다.

```json
{
  "wines": [
    {
      "id": "analyzed-wine-1",
      "display_name": "몬테스 알파 카베르네 소비뇽",
      "image_url": "/ExampleImage.png",
      "rating": 4.3,
      "title": "몬테스 알파 카베르네 소비뇽 2021",
      "recommendation_text": "진한 풍미를 원한다면 추천",
      "price_label": "35,000원"
    }
  ]
}
```

```ts
type AnalyzeWineListResponse = {
  wines: WineDetailDto[];
};
```

### 오류 응답

| Status | 조건 | 메시지 |
| --- | --- | --- |
| `400 Bad Request` | `menuImage`가 없음 | `메뉴판 이미지가 필요합니다.` |
| `400 Bad Request` | 파일 크기가 0바이트임 | `비어 있는 파일은 첨부할 수 없습니다.` |
| `413 Content Too Large` | 파일이 10MB를 초과함 | `이미지는 10MB 이하로 첨부해 주세요.` |
| `413 Content Too Large` | 전체 요청이 11MB를 초과함 | `이미지는 10MB 이하로 첨부해 주세요.` |
| `415 Unsupported Media Type` | 요청이 `multipart/form-data`가 아님 | `이미지 업로드 형식이 올바르지 않습니다.` |
| `415 Unsupported Media Type` | 허용되지 않은 MIME type | `JPG, PNG, WEBP, HEIC 이미지만 첨부할 수 있습니다.` |
| `415 Unsupported Media Type` | 파일 signature가 MIME type과 일치하지 않음 | `이미지 파일의 실제 형식이 올바르지 않습니다.` |
