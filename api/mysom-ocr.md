# Mysom OCR API

와인 메뉴 이미지에서 와인명을 추출하고 내부 DB 와인 후보를 함께 반환하는 API다. 요청 body는 이미지 바이너리이며 `multipart/form-data`가 아니다.

## 공통 이미지 요청 규칙

허용 Content-Type:

- `image/png`
- `image/jpeg`

서버 제한:

- 이미지 body가 비어 있으면 `400 Bad Request`
- 이미지 body 합산 크기가 10MiB를 초과하면 `413 Payload Too Large`

## POST /v1/wine-pairing/wines/menu-ocr

OCR 원본 항목과 내부 DB 매칭 후보를 한 배열에 함께 반환한다.

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

- 이후 페어링 요청은 숫자형 DB 와인 ID만 받는다. 사용자가 `type: "DB"` 후보를 선택하면 문자열 `id`를 숫자로 변환해 `wines[].id`로 보낸다.
- `WaMaDae` BFF는 `type: "OCR"` 원본 항목을 분석 결과에서 제외하고, 유효한 `id`가 있는 `type: "DB"` 후보만 화면에 노출한다.
- `type: "OCR"` 원본 항목은 `id`가 없으므로 페어링 요청이나 선택 결과에 직접 사용할 수 없다.
- DB 후보의 `id`가 안전한 정수로 변환되지 않으면 현재 페어링 API와 호환되지 않으므로 요청을 중단하고 오류로 처리한다.
- `type: "DB"` 항목은 `country`, `price`가 현재 `null`이므로 카드 표시에는 별도 fallback이 필요하다.

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | 이미지 body가 비어 있음 | `ErrorResponse`, message: `이미지 본문이 비어 있습니다.` |
| `413 Payload Too Large` | 이미지가 10MiB 초과 | `ErrorResponse`, message: `와인 메뉴 이미지는 10MiB 이하만 업로드할 수 있습니다.` |
| `415 Unsupported Media Type` | `Content-Type`이 `image/png`, `image/jpeg`가 아님 | Spring WebFlux 오류 응답 |
| `500 Internal Server Error` | Cloud Vision, AI 파싱, 내부 와인 검색 실패 | `ErrorResponse` 또는 Spring 오류 응답 |
