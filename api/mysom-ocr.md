# Mysom OCR API

와인 메뉴 이미지에서 와인명을 추출한 뒤 내부 와인 DB에서 매칭된 후보를 반환하는 API다. 요청 body는 이미지 바이너리이며 `multipart/form-data`가 아니다.

기준 코드: `mysom-api`의 `51dbe3f`

## 공통 이미지 요청 규칙

허용 Content-Type:

- `image/png`
- `image/jpeg`

서버 제한:

- 이미지 body가 비어 있으면 `400 Bad Request`
- 이미지 body 합산 크기가 10MiB를 초과하면 `413 Payload Too Large`

## POST /v1/wine-pairing/wines/menu-ocr

OCR 텍스트에서 얻은 와인명으로 내부 DB를 검색하고, 매칭된 DB 와인 후보를 반환한다.

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
  type: "ocr" | "db";
  name: string;
  koreanName: string | null;
  area: string | null;
  category: string | null;
  dollarPrice: number | string | null;
  wonPrice: number | string | null;
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

type WineMenuOcrExtractResponse = {
  wines: WineMenuOcrExtractItem[];
};
```

현재 서비스 구현에서는 `type: "db"` 항목만 반환한다. DTO는 `type: "ocr"`도 표현할 수 있지만, `/v1/wine-pairing/wines/menu-ocr` 흐름은 OCR 원본 행을 응답 배열에 따로 붙이지 않는다.

필드 규칙:

| 필드 | 설명 |
| --- | --- |
| `id` | DB 와인 ID 문자열. 현재 응답 후보는 페어링 요청에 쓰려면 안전한 정수로 변환 가능해야 한다. |
| `type` | JSON 값은 소문자 `"db"` 또는 `"ocr"`이다. 현재 엔드포인트 응답은 `"db"` 중심이다. |
| `name` | DB 와인 원어 이름 |
| `koreanName` | 한글 와인명. 없으면 `null` |
| `area` | 와인 생산 권역. 없으면 `null` |
| `category` | 와인 카테고리. 없으면 `null` |
| `dollarPrice` | 내부 DB 가격. decimal 값이며 없으면 `null` |
| `wonPrice` | OCR 메뉴에서 읽은 원화 가격. decimal 값이며 없으면 `null` |
| `imagePath` | 와인 이미지 경로. 없으면 `null` |
| `rating` | 와인 평점 문자열. 없으면 `null` |
| `country` | 생산 국가. 없으면 `null` |
| `region` | 세부 생산 지역. 없으면 `null` |
| `grape` | 포도 품종. 없으면 `null` |
| `vintage` | 빈티지 연도. 없으면 `null` |
| `alcohol` | 알코올 도수. 없으면 `null` |
| `body` | 바디감 단계. 없으면 `null` |
| `sweetness` | 당도 단계. 없으면 `null` |
| `tannin` | 탄닌 단계. 없으면 `null` |
| `acidity` | 산도 단계. 없으면 `null` |

예시:

```json
{
  "wines": [
    {
      "id": "1",
      "type": "db",
      "name": "Chateau Margaux",
      "koreanName": "샤또 마고",
      "area": "Bordeaux",
      "category": "Red",
      "dollarPrice": "150000.25",
      "wonPrice": "30000",
      "imagePath": "/images/wine-1.png",
      "rating": "4.8",
      "country": "France",
      "region": "Margaux",
      "grape": "Cabernet Sauvignon",
      "vintage": 2018,
      "alcohol": 13,
      "body": 4,
      "sweetness": 1,
      "tannin": 4,
      "acidity": 3
    }
  ]
}
```

### 매칭 동작

- 서버는 OCR 텍스트를 파싱한 뒤 원어 이름과 한글 이름 후보를 모은다.
- 공백 이름은 제거하고 이름 목록을 중복 제거한다.
- 내부 와인 DB 일괄 검색 API에 최대 10개 이름씩 나누어 조회한다.
- 같은 DB 와인이 여러 OCR 후보에서 매칭되면 와인 ID 기준으로 중복 제거한다.
- 응답 후보는 와인 ID 문자열 오름차순으로 정렬된다.
- 매칭 가능한 이름이 없거나 DB 후보가 없으면 `{ "wines": [] }`가 내려올 수 있다.

### 프론트엔드 선택 가이드

- 이후 페어링 요청은 숫자형 DB 와인 ID만 받는다. `id`가 안전한 정수로 변환되지 않으면 요청을 중단하고 오류로 처리한다.
- 화면 후보로는 `type === "db"`이고 유효한 `id`가 있는 항목만 사용한다.
- 카드 표시에는 `koreanName ?? name`, `imagePath`, `country`, `region`, `category`, `rating`, `dollarPrice`, `wonPrice` 등을 사용할 수 있다.
- `dollarPrice`와 `wonPrice`는 둘 다 `null`일 수 있으므로 가격 표시는 fallback을 둔다.

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | 이미지 body가 비어 있음 | `ErrorResponse`, message: `이미지 본문이 비어 있습니다.` |
| `413 Payload Too Large` | 이미지가 10MiB 초과 | `ErrorResponse`, message: `와인 메뉴 이미지는 10MiB 이하만 업로드할 수 있습니다.` |
| `415 Unsupported Media Type` | `Content-Type`이 `image/png`, `image/jpeg`가 아님 | Spring WebFlux 오류 응답 |
| `500 Internal Server Error` | Cloud Vision, AI 파싱, 내부 와인 검색 실패 | `ErrorResponse` 또는 Spring 오류 응답 |
