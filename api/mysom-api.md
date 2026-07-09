# Mysom API 명세서

이 문서는 `mysom-api` Spring WebFlux 애플리케이션의 현재 공개 HTTP 계약을 프론트엔드 관점에서 정리한 인덱스다.

기준 코드: `/Users/yoon-yeongheon/dev/mysom-api`  
기준일: 2026-07-09

## 공통

- Local Base URL: `http://localhost:8080`
- Base path: `/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- 기본 요청/응답: `application/json`
- 이미지 업로드형 요청: `image/png` 또는 `image/jpeg` 바이너리 body
- 스트리밍 응답: `text/event-stream`

브라우저가 `WaMaDae`의 Next.js BFF를 통하는 화면에서는 `/api/*` 문서를 우선 보고, 실제 백엔드 계약 확인이 필요할 때 이 문서와 하위 문서를 보면 된다.

## 인증

```http
Authorization: Bearer {token}
```

현재 Spring Security 설정상 인증이 강제되는 공개 API는 `/v1/upload/**`다. 다른 컨트롤러 API는 `permitAll`이다.

로그인/회원가입 컨트롤러는 현재 코드에 없다. `POST /v1/auth/logout`은 컨트롤러가 아니라 Spring Security logout matcher로 처리된다.

## API 목록

| 기능 | Method | Path | 인증 | 상세 문서 |
| --- | --- | --- | --- | --- |
| 로그아웃 | `POST` | `/v1/auth/logout` | 선택 | [mysom-auth.md](./mysom-auth.md) |
| 메뉴 이미지 업로드 URL 생성 | `POST` | `/v1/upload/presigned-menu-image-url` | 필요 | [mysom-upload.md](./mysom-upload.md) |
| OCR + DB 와인 후보 추출 | `POST` | `/v1/wine-pairing/wines/menu-ocr` | 없음 | [mysom-ocr.md](./mysom-ocr.md) |
| 즉시 메뉴 카테고리 추천 | `POST` | `/v1/wine-pairing/menu-category/recommend` | 없음 | [mysom-wine-pairing.md](./mysom-wine-pairing.md) |
| 와인 페어링 SSE | `POST` | `/v1/wine-pairing/stream/pairing` | 없음 | [mysom-wine-pairing.md](./mysom-wine-pairing.md) |
| 와인 페어링 후속 채팅 SSE | `POST` | `/v1/wine-pairing/stream/chat` | 없음 | [mysom-wine-pairing.md](./mysom-wine-pairing.md) |
| 비동기 메뉴 카테고리 추천 생성 | `POST` | `/v1/menu-category-recommendations` | 없음 | [mysom-menu-category-recommendations.md](./mysom-menu-category-recommendations.md) |
| 비동기 메뉴 카테고리 추천 조회 | `GET` | `/v1/menu-category-recommendations/{id}` | 없음 | [mysom-menu-category-recommendations.md](./mysom-menu-category-recommendations.md) |

## 공통 응답 타입

### ErrorResponse

```ts
type ErrorResponse = {
  status: number;
  message: string | null;
};
```

### BadRequestErrorResponse

DTO validation 실패 시 주로 사용된다.

```ts
type BadRequestErrorResponse = {
  status: 400;
  message: string;
  fields: Record<string, string[]>;
};
```

### ListResponse

```ts
type ListResponse<T> = {
  items: T[];
  count: number;
};
```

### StreamResponse

SSE의 `data:` payload로 내려오는 JSON이다.

```ts
type StreamResponse<T> = {
  fieldName: string;
  type: "json" | "text";
  data: T;
  index: number;
};
```

예시 SSE frame:

```txt
data:{"fieldName":"chat","type":"text","data":"첫째","index":0}

data:{"fieldName":"chat","type":"text","data":"둘째","index":1}
```

## 공통 오류 처리

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | DTO validation 실패 | `BadRequestErrorResponse` |
| `400 Bad Request` | `ResponseStatusException(HttpStatus.BAD_REQUEST)` | `ErrorResponse` |
| `400 Bad Request` | Exposed R2DBC 요청 오류 | `ErrorResponse`, message: `잘못된 요청입니다.` |
| `403 Forbidden` | 권한 없음 | `ErrorResponse`, message: `접근 권한이 없습니다.` |
| `500 Internal Server Error` | `IllegalArgumentException` | `ErrorResponse`, message는 예외 메시지 |
| `500 Internal Server Error` | 일반 `RuntimeException` | `ErrorResponse`, message: `서버 오류가 발생했습니다.` |

Spring WebFlux 또는 Spring Security가 직접 만드는 오류는 위 JSON 형태와 다를 수 있다. 특히 인증 실패, unsupported media type, malformed JSON은 프론트에서 status 중심으로 방어 처리하는 것이 안전하다.

## 프론트엔드 구현 메모

- 이미지 OCR API는 body를 raw 바이너리로 보낸다. `multipart/form-data`가 아니다.
- OCR 이미지 body는 서버에서 최대 10MiB까지 읽는다.
- SSE API는 `EventSource`로 POST를 보낼 수 없으므로 `fetch` + `ReadableStream` 파싱이 필요하다.
- `/v1/wine-pairing/stream/pairing`으로 대화를 시작한 `X-Chat-Id`만 `/v1/wine-pairing/stream/chat`에서 사용할 수 있다.
- 비동기 추천 API는 생성 응답 body가 없고 `Location` 헤더만 반환한다.
- `/v1/upload/presigned-menu-image-url`의 서비스 구현은 현재 `TODO("Not implemented yet")` 상태라 실제 호출 시 500 계열 오류가 날 수 있다.
