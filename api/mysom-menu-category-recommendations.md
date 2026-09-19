# Mysom 과거 메뉴 카테고리 추천 API

- 기준 백엔드: `mysom-api-demo` `68a0cb7`
- 상태: 제거됨

다음 라우트는 현재 활성 컨트롤러에 없다.

| Method | Path | 상태 |
| --- | --- | --- |
| `POST` | `/v1/menu-category-recommendations` | 제거됨 |
| `GET` | `/v1/menu-category-recommendations/{id}` | 제거됨 |

따라서 `Idempotency-Key`, `Location`, 추천 작업 ID, polling 상태를 프론트엔드 활성 흐름에 사용하지 않는다.

현재 대체 API는 세션 기반 동기 요청이다.

```http
POST /v1/wine-pairings/recommend-menu
X-Session-Id: {uuid}
Content-Type: application/json
```

요청은 `{ "pairingWineIds": ["uuid"] }`, 응답은 `{ "recommendedMenus": [{ "name": "...", "category": "해산물" }] }`다. 상세 계약은 [Mysom 메뉴 추천·와인 페어링 API](./mysom-wine-pairing.md#post-v1wine-pairingsrecommend-menu)를 참고한다.
