# `/wine/keywords` 메뉴 카테고리 추천 조회 계획

> ⚠️ 업데이트(변경됨): 이 문서가 기준으로 삼은 비동기 조회
> `GET /v1/menu-category-recommendations/{id}`(polling)와 `?id=` URL 계약은 레거시가
> 되었다. 실제 구현은 동기 API `POST /v1/wine-pairing/menu-category/recommend`
> (`api/mysom-wine-pairing.md`)를 사용한다. 결과 화면은 이전 단계에서 유지된 선택 와인
> (Zustand draft + known wines 캐시)으로 추천을 즉시 조회하며, URL의 추천 작업 ID는
> 사용하지 않는다. 아래 polling/`searchParams.id`/prefetch 관련 절은 더 이상 유효하지 않다.
> 구현 기준은 `docs/wine-keywords-menu-category-recommendation.md`를 참고한다.
>
> 추가 업데이트: 결과 화면은 두 섹션으로 나눈다. 상단에는
> `마이쏨 AI가 추천하는 메뉴 카테고리에요.` 문구와 AI 추천 메뉴 카테고리 리스트를
> 표시한다. 하단에는 기존 메뉴 리스트를 그대로 표시하되, 이 하단 목록은 백엔드/API가 아니라
> 프론트엔드 상수(`DEFAULT_MENU_CATEGORIES`)로 관리한다.

## 0. 최신 섹션 구성 기준

현재 구현 기준의 `/wine/keywords` 구조는 다음과 같다.

```text
WineKeywordsPage [Server]
├─ PageHeader [Server]
└─ MenuCategoryRecommendationPage [Client]
   ├─ AI 추천 메뉴 카테고리 섹션
   │  ├─ "마이쏨 AI가 추천하는 메뉴 카테고리에요."
   │  ├─ 추천 query 상태 패널
   │  └─ MenuCategoryList          # API 추천 결과
   └─ 기본 메뉴 카테고리 섹션
      └─ DefaultMenuCategoryGrid   # 프론트엔드 상수 기반 3열 카드
```

- 상단 AI 추천 리스트는 `POST /api/wine-pairing/menu-category/recommend` 결과를
  TanStack Query로 조회해 렌더링한다.
- 하단 기본 메뉴 리스트는
  `feature/menu-category-recommendation-result/model/default-menu-categories.ts`의
  `DEFAULT_MENU_CATEGORIES`에서 직접 읽는다.
- 하단 기본 메뉴 리스트는 서버 상태가 아니므로 Query, Zustand, `useState`에 저장하지 않는다.
- 하단 기본 메뉴 리스트는 AI 추천의 loading/error/empty 상태와 무관하게 같은 화면 아래쪽에 노출한다.
- 하단 기본 메뉴 리스트는 `designs/p2.png`의 메뉴 카드 UI에 맞춰
  `DefaultMenuCategoryGrid`/`DefaultMenuCategoryCard`로 3열 정사각 카드 형태를 사용한다.
- 상단 서버 추천 메뉴 카테고리와 하단 기본 메뉴 카테고리 모두 선택 가능하며, 선택 기준은 카테고리 이름 문자열이다.
- 선택된 카테고리가 1개 이상이면 본문 최상단에 `{count}개 선택됨` 요약을 표시한다.

## 1. 기준

- 대상 라우트: `web/src/app/wine/keywords/page.tsx`
- 기존 계획: `plans/P2_PLAN.md`
- 관련 디자인:
  - 현재 구현 기준: `designs/p2.png`
  - 메뉴/키워드 선택 계열 참고: `designs/p3.png`
- API 명세: `api/mysom-menu-category-recommendations.md`
- 적용 가이드:
  - `data-flow-layering`
  - `bff-api-gateway`
  - `rsc-rendering`
  - `rcc-rendering`
  - `storybook-authoring`
  - `style-implementation`

이 문서는 `/wine/keywords?id={id}` 페이지 한 개만 대상으로 한다. 기존
`table-keyword-select` 기반의 정적 테이블 키워드 선택 계획은 새 요구사항과 충돌하므로,
이 라우트에서는 추천 작업 ID 기반의 메뉴 카테고리 리스트 화면으로 대체한다.

## 2. 페이지 범위

라우트:

```text
/wine/keywords?id={recommendationId}
```

페이지 역할:

1. URL `searchParams.id`에서 추천 작업 ID를 읽는다.
2. `GET /v1/menu-category-recommendations/{id}`를 BFF 경유로 조회한다.
3. `PENDING`/`RUNNING`이면 polling 상태를 보여준다.
4. `SUCCEEDED`이면 `result.categories`를 메뉴 카테고리 리스트로 보여준다.
5. `FAILED`이거나 조회 오류이면 안전한 오류 메시지를 보여준다.

API 응답은 `categories: string[]`만 제공한다. 따라서 이 계획에서 "메뉴 리스트"는
메뉴 상세 객체가 아니라 추천된 메뉴 카테고리 문자열 목록으로 정의한다. 실제 음식 메뉴
ID, 이미지, 설명, 정렬 점수가 필요하면 백엔드 API 계약 추가가 필요하다.

## 3. 페이지 구조

```text
WineKeywordsPage [Server]
├─ PageHeader [Server]
└─ HydrationBoundary
   └─ MenuCategoryRecommendationPage [Client]
      ├─ RecommendationPendingState
      ├─ MenuCategoryList
      │  └─ MenuCategoryItem
      ├─ RecommendationErrorState
      └─ RecommendationEmptyState
```

`page.tsx`는 Server Component로 유지한다. `searchParams.id` 검증과 최초 조회
prefetch는 서버에서 수행하고, 이후 polling과 retry는 Client Component에서
TanStack Query로 처리한다.

## 4. RSC/RCC 경계

### Server Component

`web/src/app/wine/keywords/page.tsx`

- `searchParams.id`를 읽는다.
- ID가 없거나 숫자 문자열이 아니면 BFF 호출 없이 invalid state를 렌더링한다.
- ID가 유효하면 `QueryClient.prefetchQuery`로 초기 상태를 조회한다.
- 서버에서 same-origin BFF를 HTTP로 다시 호출하지 않고, Entity의 server-only 조회
  함수를 사용한다.
- `HydrationBoundary`로 동일 query key cache를 Client Component에 전달한다.

### Client Component

`MenuCategoryRecommendationPage`

- 동일 query key로 `useMenuCategoryRecommendationQuery(id)`를 구독한다.
- 상태가 `PENDING` 또는 `RUNNING`이면 `refetchInterval`로 polling한다.
- 상태가 `SUCCEEDED` 또는 `FAILED`이면 polling을 멈춘다.
- retry 버튼은 query `refetch`만 실행한다.
- 서버 응답 자체를 `useState`나 Zustand에 복제하지 않는다.

## 5. 상태 분류

| 상태 | 출처 | 관리 방식 |
| --- | --- | --- |
| 추천 작업 ID | URL | `searchParams.id` |
| 추천 작업 상태 | 서버 | TanStack Query |
| 추천 카테고리 목록 | 서버 응답 `result.categories` | TanStack Query에서 파생 |
| polling 여부 | 서버 status에서 파생 | Query `refetchInterval` |
| 오류 메시지 | BFF safe error 또는 response error | Query `error` / response `error` |

Zustand는 사용하지 않는다. 기존 `TableKeywordSelectionProvider`는 이 라우트에서 더 이상
필요하지 않으며, 다른 라우트가 사용하지 않는다면 `/wine/layout.tsx`에서 제거를 검토한다.

## 6. API 계약

백엔드 명세:

```http
GET /v1/menu-category-recommendations/{id}
```

```ts
type MenuCategoryRecommendationStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED";

type MenuCategoryRecommendationView = {
  id: string;
  status: MenuCategoryRecommendationStatus;
  result: {
    categories: string[];
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
};
```

상태 처리:

- `PENDING`, `RUNNING`: 리스트 대신 처리 중 UI를 표시하고 polling 유지
- `SUCCEEDED`: `result.categories` 표시
- `FAILED`: `error.message` 또는 fallback 오류 표시

## 7. BFF 설계

신규 Route Handler:

```text
web/src/app/api/menu-category-recommendations/[id]/route.ts
```

브라우저 요청:

```http
GET /api/menu-category-recommendations/{id}
```

Route Handler 책임:

- path parameter `id`가 숫자 문자열인지 검증한다.
- 백엔드 `GET /v1/menu-category-recommendations/{id}`를 호출한다.
- 사용자별/작업별 데이터로 보고 `cache: "no-store"`를 사용한다.
- 백엔드 응답을 safe DTO로 정규화한다.
- `400`, `404`, `500` 오류를 내부 정보 없는 safe message로 변환한다.
- 백엔드 origin과 내부 path를 브라우저에 노출하지 않는다.

서버 prefetch용 함수:

```text
web/src/app/entity/menu-category-recommendation/api/menu-category-recommendation.server.ts
```

Route Handler와 `page.tsx`가 같은 server-only 조회 함수를 재사용한다. Client Component는
이 파일을 import하지 않는다.

## 8. Entity 및 Feature 계층

신규 Entity:

```text
web/src/app/entity/menu-category-recommendation/
├─ model/menu-category-recommendation.type.ts
└─ api/
   ├─ menu-category-recommendation.api.ts
   ├─ menu-category-recommendation.mapper.ts
   └─ menu-category-recommendation.server.ts
```

타입:

```ts
type MenuCategoryRecommendation = {
  id: string;
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
  categories: string[];
  errorMessage: string | null;
};
```

mapper 정책:

- `result`가 `null`이면 `categories`는 빈 배열로 변환한다.
- `FAILED`이면 `error.message`를 `errorMessage`로 전달한다.
- 알 수 없는 status나 잘못된 shape는 safe error로 처리한다.

신규 Feature:

```text
web/src/app/feature/menu-category-recommendation-result/
├─ api/
│  ├─ menu-category-recommendation-query-keys.ts
│  └─ use-menu-category-recommendation-query.ts
└─ ui/
   ├─ MenuCategoryRecommendationPage.tsx
   ├─ MenuCategoryRecommendationPage.stories.tsx
   ├─ MenuCategoryList.tsx
   ├─ MenuCategoryList.stories.tsx
   ├─ MenuCategoryItem.tsx
   └─ MenuCategoryItem.stories.tsx
```

Query key:

```ts
export const menuCategoryRecommendationQueryKeys = {
  all: ["menu-category-recommendations"] as const,
  detail: (id: string) =>
    [...menuCategoryRecommendationQueryKeys.all, "detail", id] as const,
};
```

Query 정책:

- `enabled: Boolean(id)`
- `refetchInterval`은 status가 `PENDING` 또는 `RUNNING`일 때만 1500~2000ms 범위로 설정
- `retry`는 400/404 같은 검증 오류에는 과도하게 반복하지 않도록 제한
- 서버 prefetch와 Client Query Hook은 동일 key를 사용한다.

## 9. 데이터 흐름

### 최초 진입

```text
/wine/keywords?id=123
-> page.tsx [Server]
-> validate id
-> QueryClient.prefetchQuery(menuCategoryRecommendationQueryKeys.detail("123"))
-> menu-category-recommendation.server.ts
-> GET /v1/menu-category-recommendations/123
-> dehydrate
-> HydrationBoundary
-> MenuCategoryRecommendationPage
```

### 브라우저 polling

```text
useMenuCategoryRecommendationQuery("123")
-> entity API fetch("/api/menu-category-recommendations/123")
-> BFF Route Handler
-> GET /v1/menu-category-recommendations/123
-> status 확인
-> PENDING/RUNNING이면 polling 계속
-> SUCCEEDED/FAILED이면 polling 중단
```

### 성공 렌더링

```text
status: "SUCCEEDED"
-> categories = result.categories
-> MenuCategoryList
-> MenuCategoryItem[]
```

## 10. UI 설계

헤더:

- `PageHeader`
- title: `추천 메뉴`
- `routeBackPath: "/wine/ai"`

본문:

- 모바일 기준 단일 column
- `min-h-0 flex-1 overflow-y-auto`
- 처리 중, 실패, 빈 결과, 성공 상태의 높이 변화가 과도하지 않게 skeleton 또는 고정 간격 사용

성공 상태:

- 추천된 메뉴 카테고리를 리스트 또는 chip grid로 표시한다.
- API가 문자열만 제공하므로 각 item의 key는 `${category}-${index}`를 사용한다.
- 같은 category가 중복될 가능성이 있으면 중복 제거 여부는 기획 확정 전까지 하지 않고
  API 응답 순서를 그대로 표시한다.

처리 중 상태:

- `status`가 `PENDING` 또는 `RUNNING`이면 `LoadingSpinner`와 상태 문구를 표시한다.
- 사용자가 기다릴 수 있도록 화면을 유지하고 자동 polling한다.

오류 상태:

- invalid id: `추천 정보를 찾을 수 없습니다.`
- query error: BFF safe message 또는 `추천 메뉴를 불러오지 못했습니다.`
- `FAILED`: 백엔드 `error.message` 또는 fallback
- 재시도 버튼은 유효한 id가 있을 때만 표시한다.

## 11. `shared/ui` 재사용

반드시 재사용:

- `shared/ui/molecule/page-header`
- `shared/ui/atom/button`
- `shared/ui/atom/loading-spinner`

검토 대상:

- `shared/ui/molecule/card`
  - 추천 카테고리 item이 단순 chip/list라면 공용 Card까지 사용하지 않는다.
  - 상태 패널이 명확한 카드 구조라면 `Card` 합성을 사용할 수 있다.

`feature/`에서 `shared/ui/shadcn`을 직접 import하지 않는다.

## 12. Storybook 계획

Story title:

```text
Feature/menu-category-recommendation-result/<ComponentName>
```

필수 Story:

- `MenuCategoryItem`
  - `Default`
  - `LongName`
- `MenuCategoryList`
  - `Default`
  - `ManyItems`
  - `Empty`
- `MenuCategoryRecommendationPage`
  - `Pending`
  - `Running`
  - `Succeeded`
  - `SucceededEmpty`
  - `Failed`
  - `InvalidId`
  - `QueryError`

Story에서는 실제 polling을 실행하지 않고 Query cache 또는 props 기반 fixture로 상태를
재현한다. wrapper는 모바일 화면 폭만 제공하고 컴포넌트의 레이아웃 책임을 대신하지 않는다.

## 13. 접근성

- 처리 중 상태는 `role="status"`와 스크린 리더 label을 제공한다.
- 오류 상태는 `role="alert"`를 사용한다.
- 추천 카테고리 목록은 `ul/li` 또는 접근 가능한 button/list semantics를 사용한다.
- 문자열 category가 길어도 버튼/칩 내부 텍스트가 넘치지 않게 줄바꿈을 허용한다.
- 색상만으로 상태를 전달하지 않는다.

## 14. 구현 순서

1. 메뉴 카테고리 추천 Entity 타입과 mapper 작성
2. server-only 조회 함수 작성
3. `GET /api/menu-category-recommendations/[id]` BFF 작성
4. 브라우저 Entity API 함수 작성
5. query key와 query hook 작성
6. `/wine/keywords/page.tsx`에서 `searchParams.id` 검증과 prefetch/hydration 구현
7. 결과 페이지 UI 컴포넌트 작성
8. 기존 `TableKeywordSelectPage` 연결 제거 또는 새 결과 페이지로 교체
9. `/wine/layout.tsx`에서 불필요한 `TableKeywordSelectionProvider` 제거 검토
10. Storybook 상태별 Story 작성
11. 구현 후 `docs/wine-keywords-menu-category-recommendation.md` 작성

## 15. 검증

```bash
npx tsc --noEmit
npm run build
npm run build-storybook
```

추가 확인:

- `/wine/keywords`처럼 id가 없을 때 BFF 요청이 발생하지 않는지 확인
- 숫자가 아닌 id에서 안전한 invalid state가 표시되는지 확인
- 서버 prefetch와 클라이언트 query가 같은 key를 사용하는지 확인
- `PENDING`/`RUNNING`에서 polling하고 `SUCCEEDED`/`FAILED`에서 멈추는지 확인
- `SUCCEEDED`의 `categories`가 API 응답 순서대로 표시되는지 확인
- `FAILED`, `404`, 네트워크 오류에서 내부 정보가 노출되지 않는지 확인
- 작은 viewport에서 긴 category 문자열이 overflow되지 않는지 확인

## 16. 완료 기준

- `/wine/keywords/page.tsx`는 Server Component로 유지된다.
- `id`는 URL searchParams로 관리된다.
- 브라우저는 `/api/menu-category-recommendations/{id}` BFF만 호출한다.
- 초기 조회는 server-only 함수와 hydration을 사용한다.
- polling은 TanStack Query에서 status 기반으로 제어된다.
- 서버 응답은 `useState`나 Zustand에 복제하지 않는다.
- `SUCCEEDED` 결과의 `categories`가 메뉴 카테고리 리스트로 표시된다.
- pending, running, failed, invalid id, empty, success 상태가 제공된다.
