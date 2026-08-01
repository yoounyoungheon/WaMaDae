# Mysom Menu Category Recommendations API

이 문서의 API는 최신 `mysom-api` 활성 라우트가 아니다.

기준 코드: `mysom-api`의 `51dbe3f`

## 제거된 라우트

아래 비동기 메뉴 카테고리 추천 API는 최신 코드에서 컨트롤러, 도메인, 저장소, 테이블이 제거됐다.

| Method | Path | 상태 |
| --- | --- | --- |
| `POST` | `/v1/menu-category-recommendations` | 제거됨 |
| `GET` | `/v1/menu-category-recommendations/{id}` | 제거됨 |

## 대체 API

현재 메뉴 카테고리 추천은 즉시 응답 API만 사용한다.

```http
POST /v1/wine-pairing/menu-category/recommend
Content-Type: application/json
```

상세 계약은 [mysom-wine-pairing.md](./mysom-wine-pairing.md)의 `POST /v1/wine-pairing/menu-category/recommend`를 참고한다.

## 프론트엔드 처리

- `Idempotency-Key`, `Location` 헤더, polling 흐름은 더 이상 현재 백엔드 계약으로 보면 안 된다.
- 기존 클라이언트 코드가 `/v1/menu-category-recommendations`를 호출하고 있다면 `/v1/wine-pairing/menu-category/recommend`로 전환해야 한다.
- 이 문서는 과거 라우트가 제거됐음을 명시하기 위해 남겨둔다.
