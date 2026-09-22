# Mysom API 명세

이 문서는 프론트엔드가 참조할 `mysom-api-demo`의 현재 활성 HTTP 계약을 요약한다. 세부 요청·응답은 [와인 메뉴 추출](./mysom-ocr.md)과 [와인 페어링](./mysom-wine-pairing.md) 문서를 기준으로 한다.

- 기준 프로젝트: `/Users/yoon-yeongheon/dev/mysom-demo/mysom-api-demo`
- 기준 커밋: `68a0cb7`
- 확인일: 2026-09-07
- Local Base URL: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## 활성 API

| 순서 | 기능 | Method | Path | 응답 |
| --- | --- | --- | --- | --- |
| 1 | 와인 메뉴 이미지 추출 및 세션 생성 | `POST` | `/v1/wine-pairings/extract-wine-menu` | JSON |
| 2 | 선택 와인 기반 메뉴 추천 | `POST` | `/v1/wine-pairings/recommend-menu` | JSON |
| 3 | 와인 페어링 생성 | `POST` | `/v1/wine-pairings/pairing` | SSE |
| 4 | 일반 후속 대화 또는 재페어링 | `POST` | `/v1/wine-pairings/chat` | SSE |

현재 API 모듈에 활성화된 업무 컨트롤러는 위 네 라우트뿐이다. 인증, 로그아웃, presigned upload, 독립 wine search API는 제공하지 않는다.

## 세션 기반 호출 순서

모든 요청은 동일한 `X-Session-Id`를 사용한다. 값은 임의 문자열이 아니라 UUID여야 한다.

```text
클라이언트가 새 UUID 생성
-> extract-wine-menu (세션과 와인 메뉴 생성)
-> recommend-menu (선택 wine ID로 추천 메뉴 저장)
-> pairing (선택 wine ID + 추천 menu name으로 페어링)
-> chat (완료된 페어링 문맥으로 대화 또는 재페어링)
```

핵심 불변식:

- `extract-wine-menu` 응답의 `wines[].id`만 이후 `pairingWineIds`와 `wineIds`에 사용한다.
- `recommend-menu` 응답의 `recommendedMenus[].name`만 `pairing.menuNames`에 사용한다.
- 다른 세션의 wine ID나 현재 추천 결과에 없는 menu name은 `404`다.
- `/chat`은 페어링이 완료되어 세션 상태가 채팅 가능해진 뒤 호출한다.
- 프론트는 페이지마다 새 ID를 만들지 않고 한 워크플로 전체에서 같은 `X-Session-Id`를 유지한다.

## 공통 헤더

```http
X-Session-Id: 0198b013-f4a7-7a91-a232-20f4fe638b38
```

- 네 API 모두 필수다.
- Spring이 `UUID`로 역직렬화하므로 누락되거나 UUID 형식이 아니면 요청 단계에서 `400`이 발생할 수 있다.
- 현재 Spring Security 설정은 없으며 bearer 인증 계약도 없다.

## 공통 타입

```ts
type SessionId = string; // UUID
type PairingWineId = string; // UUID, 현재 세션의 wine menu 항목 ID

type Price = {
  amount: number; // JSON decimal number
  currency: "KRW" | "USD" | "EUR";
  currencySign: "₩" | "$" | "€";
  koreanUnit: "원" | "달러" | "유로";
};

type Wine = {
  id: PairingWineId;
  wineName: string;
  vintage: number | null;
  alcohol: string | null;
  price: Price[] | null;
  country: string | null;
  region: string | null;
  tannin: number | null; // 0..5
  body: number | null; // 0..5
  sweetness: number | null; // 0..5
  acid: number | null; // 0..5
  wineBottleImageUrl: string | null;
};
```

`alcohol`은 숫자가 아니라 `"12.5% ~ 13.0%"` 같은 문자열이다. 산도 필드명은 `acidity`가 아니라 `acid`다.

## 오류 응답

도메인 오류는 다음 형태다.

```ts
type ErrorResponse = {
  status: number;
  message: string | null;
};

type BadRequestErrorResponse = ErrorResponse & {
  status: 400;
  fields: Record<string, string[]>;
};
```

컨트롤러가 OpenAPI에 `BadRequestErrorResponse`를 선언하지만, 현재 전역 validation 변환기가 확인되지 않으므로 malformed JSON, header type mismatch, bean validation 오류는 Spring WebFlux 기본 오류 body일 수 있다. 프론트 BFF는 백엔드 오류 body를 그대로 노출하지 말고 HTTP status 중심으로 안전한 메시지로 변환한다.

SSE 연결이 시작된 뒤 AI 생성이 실패하면 정상 JSON 오류 응답이 아니라 연결 오류로 끝날 수 있다. 스트림 소비자는 HTTP `200`만으로 성공을 확정하지 말고 최종 `JSON` frame과 stream completion을 함께 확인해야 한다.

## 이전 계약과의 차이

- Base path: `/v1/wine-pairing` → `/v1/wine-pairings`
- Header: `X-Chat-Id` → UUID `X-Session-Id`
- 이미지 요청: raw 단일 image body → `multipart/form-data`의 `wineMenuImages` 다중 part
- 추출 응답: `type: OCR | DB` 제거, `confidence`, `isCatalogMatched`, 맛 특성, 병 이미지 URL 추가
- 메뉴 추천 요청: `wineIds` → `pairingWineIds`
- 메뉴 추천 응답: `menuCategories` → `recommendedMenus[{ name, category }]`
- 페어링 요청: `menuCategories[{ name }]` → `menuNames: string[]`
- SSE envelope `STREAM | JSON`은 유지되지만 최종 wine 필드가 확장되고 세션 수명 규칙이 바뀌었다.

## 비활성·제거 라우트

다음 경로는 현재 컨트롤러에 없으므로 호출하지 않는다.

- `/v1/auth/*`
- `/v1/upload/*`
- `/v1/menu-category-recommendations*`
- `/v1/wine-pairing/*`
