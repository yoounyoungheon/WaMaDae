# Mysom 와인 메뉴 추출 API

- 기준 백엔드: `mysom-api-demo` `68a0cb7`
- 워크플로 단계: 1/4

## POST /v1/wine-pairings/extract-wine-menu

한 장 이상의 와인 메뉴 이미지를 OCR/AI로 해석하고, 카탈로그 후보를 결합한 와인 메뉴를 세션에 저장한다. 응답 wine ID는 이후 메뉴 추천과 페어링에서 사용하는 세션 전용 UUID다.

### Request

```http
POST /v1/wine-pairings/extract-wine-menu
X-Session-Id: {uuid}
Content-Type: multipart/form-data; boundary=...
Accept: application/json
```

| 항목 | 타입 | 필수 | 규칙 |
| --- | --- | --- | --- |
| `X-Session-Id` | UUID header | 예 | 워크플로 시작 전에 클라이언트가 생성 |
| `wineMenuImages` | file part 반복 | 예 | PNG/JPEG, 각 파일 최대 10MiB |

part 이름은 반드시 `wineMenuImages`다. 여러 이미지는 같은 이름으로 반복하며 서버는 multipart 순서를 유지한다.

```bash
curl -X POST 'http://localhost:8080/v1/wine-pairings/extract-wine-menu' \
  -H 'X-Session-Id: 0198b013-f4a7-7a91-a232-20f4fe638b38' \
  -H 'Accept: application/json' \
  -F 'wineMenuImages=@front.png;type=image/png' \
  -F 'wineMenuImages=@back.jpg;type=image/jpeg'
```

검증은 multipart가 선언한 MIME만 신뢰하지 않는다. 서버는 파일 bytes의 PNG/JPEG magic bytes를 판별하고, 파일명 확장자도 `png`, `jpg`, `jpeg` 중 하나인지 확인한다.

### Response

Status: `200 OK`

```ts
type WineMenuExtractResponse = {
  wines: Array<Wine & {
    confidence: number; // 0..1
    isCatalogMatched: boolean;
  }>;
};
```

`Wine`의 전체 정의는 [공통 명세](./mysom-api.md#공통-타입)를 참고한다.

```json
{
  "wines": [
    {
      "id": "e501190d-ad82-460a-9d3d-b78999d49841",
      "wineName": "클라우디 베이 소비뇽 블랑",
      "vintage": 2023,
      "alcohol": "12.5% ~ 13.0%",
      "price": [{ "amount": 55000, "currency": "KRW", "currencySign": "₩", "koreanUnit": "원" }],
      "country": "New Zealand",
      "region": "Marlborough",
      "tannin": 1.0,
      "body": 2.5,
      "sweetness": 1.0,
      "acid": 4.0,
      "wineBottleImageUrl": "https://example.com/wines/cloudy-bay.jpg",
      "confidence": 0.95,
      "isCatalogMatched": true
    }
  ]
}
```

필드 해석:

- `isCatalogMatched: true`면 카탈로그 후보의 이름·빈티지·도수·지역·맛 특성·이미지 일부가 적용된 항목이다.
- `false`여도 유효한 세션 wine이며 선택과 후속 요청에 사용할 수 있다.
- 하나의 OCR 항목에 유사 카탈로그 후보가 여러 개면 응답 wine 후보도 여러 개가 될 수 있다.
- 카탈로그 검색 실패 시 서버는 OCR 후보로 fallback할 수 있다.
- `wines`가 빈 배열인 성공 응답도 가능하므로 프론트는 선택 단계로 진행시키지 않는다.

### 세션 동작

런타임 구현은 같은 세션에 아직 메뉴 추천이 저장되지 않았다면 현재 와인 메뉴 재추출을 허용한다. 메뉴 추천 이후 같은 세션으로 다시 추출하면 `409`다. 다만 Swagger 설명은 “미사용 세션 ID”를 요구하므로, 프론트의 안정적인 기본 정책은 **새 분석 시마다 새 UUID를 생성하는 것**이다.

### Error cases

| Status | 조건 | 대표 message |
| --- | --- | --- |
| `400` | header 누락/UUID 형식 오류, part 누락, 빈 파일 | Spring 기본 오류 또는 `와인 메뉴 이미지가 비어 있습니다.` |
| `400` | 실제 bytes가 PNG/JPEG가 아님 | `PNG 또는 JPEG 이미지만 지원합니다.` |
| `400` | 파일명 확장자가 허용되지 않음 | `PNG 또는 JPEG 이미지만 지원합니다.` |
| `409` | 메뉴 추천이 시작된 세션으로 재추출 | `메뉴 추천이 시작된 세션에서는 와인 메뉴를 다시 등록할 수 없습니다.` |
| `409` | 동시 생성 경합으로 세션이 이미 생성됨 | `이미 존재하는 페어링 세션입니다.` |
| `413` | 이미지 한 장이 10MiB 초과 | 이미지 크기 제한 message |
| `500` | OCR/AI 처리 실패 | `ErrorResponse` 또는 Spring 오류 |

전체 이미지 수와 multipart 전체 크기에 대한 명시적인 업무 제한은 현재 코드에 없다. 프론트 BFF는 운영 안전을 위해 별도의 개수/총량 제한을 정하고 문서화해야 한다.
