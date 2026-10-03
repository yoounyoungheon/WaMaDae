# `/wine/keywords` 메뉴 카테고리 추천 조회 계획

> 보관 문서: 이 계획은 이전 API 계약을 설명한다. 현재 설계는 [`/wine/keywords` 세션 기반 메뉴 추천 설계](./wine-keywords-enhanced-design-plan.md)를 기준으로 한다.

## 1. 기준

- 대상 라우트: `web/src/app/wine/keywords/page.tsx`
- 진입 라우트: `web/src/app/wine/list/page.tsx`
- API 명세: `api/mysom-wine-pairing.md`의 `POST /v1/wine-pairing/menu-category/recommend`
- 관련 디자인: `designs/p2.png`, `designs/p3.png`
- 적용 가이드: `data-flow-layering`, `bff-api-gateway`, `rsc-rendering`, `rcc-rendering`, `storybook-authoring`, `style-implementation`

이 문서는 최신 동기 메뉴 카테고리 추천 API 기준의 `/wine/keywords` 계획이다. 과거 `GET /v1/menu-category-recommendations/{id}` polling, `?id=` URL 계약, 추천 작업 ID prefetch는 더 이상 사용하지 않는다.

## 2. 페이지 역할

`/wine/keywords`는 이전 단계에서 선택한 와인으로 추천 메뉴 카테고리를 조회하고, 사용자가 실제 페어링에 사용할 메뉴 카테고리를 고르는 화면이다.

```text
WineKeywordsPage [Server]
├─ PageHeader [Server]
└─ MenuCategoryRecommendationPage [Client]
   ├─ 선택 개수 요약
   ├─ AI 추천 메뉴 카테고리 섹션
   │  ├─ "마이쏨 AI가 추천하는 메뉴 카테고리에요."
   │  ├─ 추천 query 상태 패널
   │  └─ MenuCategoryList
   ├─ 기본 메뉴 카테고리 섹션
   │  └─ DefaultMenuCategoryGrid
   └─ 하단 "와인 추천받기" 버튼
```

## 3. API 계약

브라우저는 same-origin BFF만 호출한다.

```http
POST /api/wine-pairing/menu-category/recommend
Content-Type: application/json
```

BFF는 최신 `mysom-api` 동기 API를 호출한다.

```http
POST /v1/wine-pairing/menu-category/recommend
Content-Type: application/json
```

요청:

```ts
type MenuCategoryRecommendRequest = {
  wines: Array<{
    id: string;
    name: string;
    koreanName: string;
  }>;
};
```

백엔드 응답:

```ts
type MenuCategoryRecommendResponse = {
  menuCategories: Array<{ name: string }>;
};
```

BFF 응답:

```ts
type RecommendResponse = {
  categories: string[];
};
```

## 4. 상태 관리

| 상태 | 출처 | 관리 방식 |
| --- | --- | --- |
| 선택 와인 ID | `/wine/list` 사용자 draft | `WineListSelectionProvider` Zustand |
| 선택 와인 카드 데이터 | 검색/OCR 응답 | TanStack Query `known wines` cache |
| 추천 요청 body | 선택 와인 데이터에서 파생 | `build-menu-category-recommendation-request` |
| AI 추천 카테고리 | 동기 API 응답 | TanStack Query |
| 기본 카테고리 | 프론트 상수 | `DEFAULT_MENU_CATEGORIES` |
| 선택 카테고리 | 현재 화면 draft | `useState<string[]>` |
| 페어링 요청 스냅샷 | 다음 `/wine/chat` 복원용 | `sessionStorage` |

추천 작업 ID, polling status, `searchParams.id`, `Location` 헤더는 상태로 두지 않는다.

### Source Of Truth

`/wine/keywords`가 추천 API를 호출할 때 사용하는 source of truth는 `sessionStorage`의 `MenuCategoryRecommendationRequest` 스냅샷이다.

구체 정책:

- 정상 라우트 이동에서는 `/wine/list`가 `saveMenuCategoryRecommendationRequest(request)`를 먼저 호출한다.
- `/wine/keywords`는 hydration 이후 `loadMenuCategoryRecommendationRequest()`로 스냅샷을 읽는다.
- 스냅샷이 없거나 invalid이면 추천 API를 호출하지 않고 빈 상태를 표시한다.
- Zustand와 `known wines` cache는 `/wine/list` 내부 선택/표시를 위한 상태이며, `/wine/keywords` 리로드 복원에는 의존하지 않는다.
- URL query는 source of truth가 아니다. `?id=`가 있어도 무시한다.

## 5. 데이터 흐름

```text
[/wine/list]
-> 사용자가 와인 선택
-> selectedWineIds + known wines cache 유지
-> 다음 버튼 클릭
-> router.push("/wine/keywords")

[/wine/keywords]
-> useStoredMenuCategoryRecommendationRequest()가 sessionStorage 스냅샷에서 선택 와인 요청 복원
-> useMenuCategoryRecommendationsQuery(request)
-> fetch POST /api/wine-pairing/menu-category/recommend
-> BFF validation
-> POST /v1/wine-pairing/menu-category/recommend
-> { menuCategories: [{ name }] }
-> BFF maps to { categories: string[] }
-> MenuCategoryList 렌더링

[와인 추천받기]
-> buildWinePairingRequest(selectedWines, selectedCategories)
-> saveWinePairingRequest({ wines: [{ id: number }], menuCategories })
-> router.push("/wine/chat")
```

## 6. BFF 책임

`web/src/app/api/wine-pairing/menu-category/recommend/route.ts`

- `Content-Type: application/json`만 받는다.
- `wines` 배열이 1개 이상인지 검증한다.
- `wines[].id`, `wines[].name`, `wines[].koreanName`은 공백 아닌 문자열이어야 한다.
- 최대 와인 수와 필드 길이 제한으로 과도한 요청을 방어한다.
- 백엔드 오류 body와 내부 URL은 브라우저에 그대로 노출하지 않는다.
- 백엔드 `400`은 사용자 입력 오류 메시지로, 그 외 실패는 `502` safe message로 변환한다.

## 7. 파일별 구현 계획

```txt
web/src/app/wine/keywords/page.tsx
web/src/app/feature/menu-category-recommendation-result/ui/MenuCategoryRecommendationPage.tsx
web/src/app/feature/menu-category-recommendation-result/api/use-menu-category-recommendations-query.ts
web/src/app/feature/menu-category-recommendation-result/api/menu-category-recommendation-query-keys.ts
web/src/app/feature/menu-category-recommendation-result/lib/use-stored-recommendation-request.ts
web/src/app/entity/menu-category-recommendation/api/menu-category-recommendation.api.ts
web/src/app/entity/menu-category-recommendation/api/menu-category-recommendation.server.ts
web/src/app/entity/menu-category-recommendation/api/menu-category-recommendation.mapper.ts
web/src/app/entity/menu-category-recommendation/model/menu-category-recommendation.type.ts
web/src/app/api/wine-pairing/menu-category/recommend/route.ts
```

### `page.tsx`

- Server Component로 유지한다.
- `searchParams`를 읽지 않는다.
- `PageHeader`의 `routeBackPath`는 `/wine/list`다.
- 데이터 prefetch/hydration은 사용하지 않는다. 추천 요청은 클라이언트 hydration 이후 sessionStorage를 읽은 뒤 시작된다.

### `use-stored-recommendation-request.ts`

- Client hook이다.
- 최초 렌더에서는 `{ request: null, isHydrated: false }`를 반환한다.
- `useEffect`에서 `loadMenuCategoryRecommendationRequest()`를 호출해 상태를 채운다.
- 저장소 값이 invalid이면 `request: null`로 둔다.
- API 요청은 `isHydrated && request?.wines.length > 0`일 때만 가능하다.

### `menu-category-recommendation-query-keys.ts`

Query key는 배열 factory로 유지한다.

```ts
export const menuCategoryRecommendationQueryKeys = {
  all: ["menu-category-recommendations"] as const,
  recommend: (wines: MenuCategoryRecommendationRequest["wines"]) =>
    [...menuCategoryRecommendationQueryKeys.all, "recommend", { wines }] as const,
};
```

이 key의 `menu-category-recommendations` 문자열은 클라이언트 캐시 namespace일 뿐, 제거된 백엔드 path를 뜻하지 않는다.

### `use-menu-category-recommendations-query.ts`

- `queryFn`은 `fetchMenuCategoryRecommendations(request, signal)`만 호출한다.
- `enabled`는 `request.wines.length > 0`.
- `staleTime: Infinity`, `retry: 1`을 유지한다.
- polling 옵션은 두지 않는다.
- 카테고리 정렬/필터링 같은 의미 있는 로직을 넣지 않는다.

### Entity API/Server/Mapper

- 브라우저 API 함수는 `/api/wine-pairing/menu-category/recommend`만 호출한다.
- server-only helper는 `buildMysomApiUrl("/v1/wine-pairing/menu-category/recommend")`만 호출한다.
- mapper는 `{ menuCategories: [{ name }] }`를 `string[]`로 변환한다.
- 빈 이름은 mapper에서 제거해도 되지만, 백엔드 계약 오류를 숨기지 않도록 필요하면 BFF에서 safe error로 처리한다.

### BFF Route Handler

- `Content-Type`이 JSON이 아니면 `415`.
- body 파싱 실패는 `400`.
- `wines`가 배열이 아니거나 비어 있으면 `400`.
- `wines` 길이가 `MAX_WINES`를 넘으면 `400`.
- `id/name/koreanName`이 공백 문자열이거나 길이 제한을 넘으면 `400`.
- 백엔드 `400`은 `{ message: "추천할 와인 정보가 올바르지 않습니다." }`로 변환한다.
- 그 외 백엔드 실패는 `502`와 `{ message: "추천 메뉴를 불러오지 못했습니다." }`를 반환한다.

## 8. UI 정책

- 상단 AI 추천 리스트는 loading, error, empty 상태를 가진다.
- 하단 기본 메뉴 카테고리 리스트는 AI 추천 상태와 무관하게 항상 표시한다.
- 상단 추천 카테고리와 하단 기본 카테고리는 같은 선택 배열을 공유한다.
- 같은 이름의 카테고리는 중복 선택하지 않는다.
- 선택된 카테고리 개수가 1개 이상이면 `{count}개 선택됨` 요약을 표시한다.
- 선택 카테고리가 없거나 정수로 변환 가능한 와인 ID가 없으면 "와인 추천받기" 버튼을 비활성화한다.
- `PageHeader.routeBackPath`는 `/wine/list`다.

## 9. 구현 순서

1. API 명세 링크와 타입을 `api/mysom-wine-pairing.md` 기준으로 유지한다.
2. `/api/menu-category-recommendations/[id]` BFF, polling query, `searchParams.id` 처리 코드가 남아 있다면 제거한다.
3. `menuCategoryRecommendationQueryKeys`는 동기 추천 query key로만 사용한다.
4. 추천 요청 builder가 `id/name/koreanName`을 모두 보존하는지 확인한다.
5. `/wine/keywords`에서 추천 API 실패 시 하단 기본 카테고리 선택은 계속 가능하게 둔다.
6. "와인 추천받기" 버튼이 페어링 요청 스냅샷을 저장하고 `/wine/chat`으로 이동하는지 확인한다.

## 10. 테스트/검증

- `loadMenuCategoryRecommendationRequest()`가 invalid JSON, 빈 wines, 공백 필드를 `null` 처리한다.
- 저장된 request가 없으면 추천 BFF 요청이 발생하지 않는다.
- 저장된 request가 있으면 `/api/wine-pairing/menu-category/recommend`를 1회 호출한다.
- BFF는 JSON content-type, wines shape, 필드 길이를 검증한다.
- 추천 API 실패 상태에서도 `DefaultMenuCategoryGrid`가 렌더링된다.
- 카테고리 선택 후 "와인 추천받기" 클릭 시 `saveWinePairingRequest`가 호출되고 `/wine/chat`으로 이동한다.

## 11. 완료 기준

- `/wine/keywords?id={id}` 없이 `/wine/keywords` 단독 진입 구조로 동작한다.
- `GET /v1/menu-category-recommendations/{id}` 호출이 없다.
- `POST /v1/wine-pairing/menu-category/recommend`만 메뉴 카테고리 추천 API로 사용한다.
- polling, `PENDING`/`RUNNING`/`SUCCEEDED`/`FAILED` 상태 모델이 코드와 문서에 활성 계약처럼 남아 있지 않다.
- AI 추천 실패 시에도 기본 카테고리 선택과 `/wine/chat` 이동 흐름이 깨지지 않는다.
