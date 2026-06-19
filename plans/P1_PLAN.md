# P1 데이터 흐름 및 레이어 마이그레이션 계획

## 기준

이 계획은 `mysom-frontend-guidance-mcp`의 `data-flow-layering` 가이드
(최종 갱신: 2026-06-19 KST 확인)를 기준으로 현재 P1 구현을 재구성한다.

핵심 원칙은 다음과 같다.

```txt
초기 렌더링용 서버 데이터
-> Server Component

Client Component의 서버 상태
-> TanStack Query

여러 Client Component가 공유하는 UI 상태
-> Zustand

컴포넌트 내부의 짧은 임시 상태
-> useState / useRef

공유하거나 새로고침 후 복원해야 하는 조건
-> URL searchParams
```

프로젝트의 `web/AGENTS.md`는 Feature UI 위치를
`src/app/feature/<feature-name>/ui`로 규정한다. 따라서 이번 P1에서는
디렉터리를 `src/features`, `src/entities`로 일괄 이동하지 않고 기존
`src/app` 하위 경로를 유지한다. 대신 각 폴더의 책임을 가이드의
Entity/Feature 역할에 맞게 변경한다.

## 화면 범위

`p1_1`과 `p1_2`는 별도 라우트가 아니라 `/wine/ai` 페이지의 상태 차이다.

- `p1_1`: 메뉴판 이미지 업로드 영역이 열려 있고 선택된 와인이 없는 상태
- `p1_2`: 분석 또는 검색으로 선택한 와인이 `WINES` 영역에 표시된 상태

페이지 라우트는 하나만 유지한다.

```txt
web/src/app/wine/ai/page.tsx
```

`page.tsx`는 Server Component로 유지하고 화면의 상호작용만
`WineListSelectPage` Client Boundary 아래에서 처리한다.

## 현재 구현의 문제

현재 `business/useWineListSelect.ts`는 다음 책임을 한 곳에서 수행한다.

- `useEffect + fetch` 기반 검색
- 검색 결과 서버 데이터를 `useState`에 저장
- 분석 결과 서버 데이터를 `useState`에 저장
- 로딩 상태를 별도 `useState`로 복제
- 파일 미리보기와 섹션 열림 상태 관리
- 선택 와인 목록 관리

이는 변경된 가이드의 다음 규칙과 맞지 않는다.

- API 결과를 `useState`에 직접 저장하지 않는다.
- Client Component의 서버 상태는 TanStack Query로 관리한다.
- API 함수와 Query/Mutation Hook을 분리한다.
- Query Hook은 query key와 캐시 정책만 담당한다.
- 서버 데이터와 공유 UI 상태를 같은 hook에 섞지 않는다.
- 동일한 서버 데이터를 Query cache와 Zustand에 중복 저장하지 않는다.

또한 현재 `business`, `presentation`, `client` 구조는 데이터 정의와
사용자 use case의 경계가 불명확하다. 이를 Entity와 Feature 책임으로
재분류한다.

## 상태 분류

| 상태 | 출처/생명주기 | 관리 방식 |
|---|---|---|
| 와인 검색 결과 | 서버 원본, 검색어별 캐시 필요 | TanStack Query |
| 메뉴판 분석 결과 | 서버 mutation 응답 | TanStack Query mutation |
| 와인 상세 표시 데이터 | 서버 원본 | TanStack Query detail cache |
| 선택된 와인 ID와 순서 | 사용자가 만드는 다단계 임시 선택 | Zustand |
| 검색 input 값 | 현재 화면 내부의 임시 입력 | `useState` |
| debounce된 검색어 | 검색 요청 빈도 제어 | Feature 전용 `useDebouncedValue` hook |
| 메뉴판 `File` | 현재 화면 내부 브라우저 객체 | `useRef` |
| 메뉴판 preview URL | 현재 화면 내부 브라우저 객체 | `useState` + `useEffect` cleanup |
| 사진 영역 펼침 여부 | 현재 화면 내부 UI 상태 | `useState` |
| 검색/분석 로딩 상태 | Query/Mutation에서 파생 | `isFetching` / `isPending` |
| 검색/분석 오류 | Query/Mutation에서 파생 | `error` / `isError` |

검색어는 P1에서 링크 공유나 새로고침 복원 요구가 없다. 따라서
`searchParams`로 올리지 않고 로컬 상태로 유지한다. 해당 요구가 추가될
때만 URL을 source of truth로 변경한다.

## 핵심 설계 결정

### 1. 서버 데이터는 TanStack Query에만 둔다

검색 결과와 분석 결과를 `useState` 또는 Zustand에 저장하지 않는다.

검색은 `useQuery`, 이미지 분석은 `useMutation`으로 처리한다. 로딩과 오류
상태도 Query/Mutation 결과를 그대로 사용한다.

### 2. Zustand에는 선택 ID와 순서만 둔다

선택 목록은 여러 UI 영역과 다음 단계에서 공유하는 클라이언트 draft다.
하지만 와인 카드 데이터 자체는 서버 데이터이므로 Zustand에 복제하지
않는다.

```ts
type WineListSelectionState = {
  selectedWineIds: string[];
  addWineId: (wineId: string) => void;
  replaceWineIds: (wineIds: string[]) => void;
  removeWineId: (wineId: string) => void;
  reset: () => void;
};
```

컴포넌트는 필요한 값과 action만 selector로 구독한다. 전체 store 구독은
금지한다.

### 3. 선택 카드 데이터는 detail cache에서 읽는다

검색 결과에서 와인을 선택하거나 분석이 성공하면 응답에 포함된 완전한
와인 객체를 동일한 detail query key에 `setQueryData`한다. 그 후 Zustand의
선택 ID만 변경한다.

```txt
검색 결과 선택
-> wine detail cache 갱신
-> selectedWineIds에 ID 추가
-> SelectedWineSection은 detail query로 카드 데이터 구독

메뉴판 분석 성공
-> 응답 와인별 detail cache 갱신
-> selectedWineIds를 분석 결과 ID 순서로 교체
```

명시적인 사용자 이벤트에서 cache와 선택 상태를 갱신하며
`useEffect`로 Query 결과를 Zustand에 동기화하지 않는다.

detail cache miss에 대비해 `GET /api/wines/[wineId]`를 추가한다. 검색 또는
분석 직후에는 cache가 이미 채워져 있으므로 같은 데이터를 즉시 다시
요청하지 않는다.

### 4. 초기 hydration은 적용하지 않는다

P1의 최초 화면은 검색어, 분석 결과, 선택 목록이 모두 비어 있다. 초기
렌더링에 필요한 서버 데이터가 없으므로 Server Component prefetch와
hydration은 추가하지 않는다.

다음 중 하나가 생기면 동일 query key를 사용한 prefetch/dehydrate를
도입한다.

- 기본 추천 와인 목록을 최초 렌더링에 표시
- 서버에 저장된 선택 draft를 복원
- URL 검색어로 진입 즉시 검색 결과를 표시

## 목표 디렉터리 구조

```txt
web/src/app/
├─ layout.tsx
├─ providers.tsx
│
├─ shared/
│  ├─ api/
│  │  └─ query-client.ts
│  └─ ui/
│     └─ ...
│
├─ entity/
│  └─ wine/
│     ├─ api/
│     │  ├─ wine.api.ts
│     │  ├─ wine-menu-image.server.ts
│     │  ├─ wine.mapper.ts
│     │  └─ wine.server.ts
│     └─ model/
│        ├─ wine-menu-image.ts
│        └─ wine.type.ts
│
├─ feature/
│  └─ wine-list-select/
│     ├─ api/
│     │  ├─ wine-query-keys.ts
│     │  ├─ use-analyze-wine-list-mutation.ts
│     │  ├─ use-selected-wines-queries.ts
│     │  └─ use-wine-search-query.ts
│     ├─ lib/
│     │  └─ seed-wine-detail-cache.ts
│     ├─ model/
│     │  ├─ use-debounced-value.ts
│     │  ├─ use-wine-list-select-controller.ts
│     │  ├─ wine-list-selection-provider.tsx
│     │  └─ wine-list-selection.store.ts
│     └─ ui/
│        ├─ WineListSelectHeader.tsx
│        ├─ WineListSelectHeader.stories.tsx
│        ├─ WineListSelectPage.tsx
│        ├─ WineListSelectPage.stories.tsx
│        ├─ WineMenuPhotoSection.tsx
│        ├─ WineMenuPhotoSection.stories.tsx
│        ├─ PhotoUploadBox.tsx
│        ├─ PhotoUploadBox.stories.tsx
│        ├─ WineSearchSection.tsx
│        ├─ WineSearchSection.stories.tsx
│        ├─ WineSearchResultList.tsx
│        ├─ WineSearchResultList.stories.tsx
│        ├─ WineSearchResultItem.tsx
│        ├─ WineSearchResultItem.stories.tsx
│        ├─ SelectedWineSection.tsx
│        ├─ SelectedWineSection.stories.tsx
│        ├─ SelectedWineCard.tsx
│        ├─ SelectedWineCard.stories.tsx
│        └─ wine-list-select.props.ts
│
├─ api/
│  ├─ wines/
│  │  ├─ search/route.ts
│  │  └─ [wineId]/route.ts
│  └─ wine-lists/
│     └─ analyze/route.ts
│
└─ wine/
   └─ ai/
      └─ page.tsx
```

## 레이어 책임

### `app/wine/ai/page.tsx`

- Server Component 유지
- `WineListSelectHeader`와 `WineListSelectPage` 조합
- 초기 서버 데이터가 생기기 전까지 Query prefetch 없음
- 비즈니스 로직과 client hook을 직접 포함하지 않음

### `shared/api`

- 브라우저 생명주기 동안 한 번 생성되는 `QueryClient` 설정
- 프로젝트 공통 query 기본값 관리
- 특정 와인 도메인 타입이나 query key를 포함하지 않음

권장 기본값:

```ts
queries: {
  staleTime: 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
}
```

데이터 특성이 다른 query는 각 Feature Query Hook에서 재정의한다.

### `entity/wine`

와인 데이터 정의와 네트워크 요청을 담당한다.

- `wine.type.ts`: `Wine`, `WineSearchItem`, API DTO 타입
- `wine.api.ts`: 검색, 상세, 분석 endpoint 호출 함수
- `wine.mapper.ts`: API DTO를 앱의 와인 모델로 변환하는 순수 함수
- `wine.server.ts`: Route Handler가 사용하는 mock 데이터와 server-only 조회

Entity에는 React hook, 선택 상태, 화면 이벤트 핸들러를 두지 않는다.

### `feature/wine-list-select/api`

와인 선택 use case의 Query/Mutation Hook과 query key를 담당한다.

- 검색 query key와 캐시 정책
- 선택된 ID별 detail query 조합
- 메뉴판 분석 mutation

Query Hook 내부에는 필터링, 선택 추가, UI 열림 처리 같은 비즈니스/UI
로직을 넣지 않는다.

### `feature/wine-list-select/model`

클라이언트 draft와 화면 상호작용을 조합한다.

- 선택 와인 ID Zustand store
- 검색 input, 파일, preview, 섹션 열림 상태
- Query/Mutation 결과를 UI props로 조합
- 검색 결과 선택, 분석 성공, 선택 제거 이벤트

서버 응답 배열과 수동 로딩 상태는 보관하지 않는다.

### `feature/wine-list-select/ui`

- 도메인 props를 받아 렌더링
- QueryClient나 API URL을 직접 알지 않음
- 기존 디자인과 컴포넌트 분리는 유지
- 기존 shared atom/molecule을 조합

## Entity 모델

기존 `presentation/wine-list-select.view-model.ts`의 타입은 와인 Entity로
이동한다.

```ts
export type WineId = string;

export type Wine = {
  id: WineId;
  name: string;
  imageUrl: string;
  rating: number;
  title: string;
  recommendationText: string;
  priceLabel: string;
};

export type WineSearchItem = Wine & {
  regionAndType: string;
  searchPriceLabel: string;
};

export type MenuImagePreview = {
  fileName: string;
  previewUrl: string;
};
```

API의 snake_case 응답 타입은 `wine.api.ts` 또는 별도 DTO 선언에 두고
mapper를 통해 위 타입으로 변환한다. UI 타입과 API 응답 shape를 같은
타입으로 취급하지 않는다.

## Query key

query key는 별도 파일에서 배열 factory로 관리한다.

```ts
export const wineQueryKeys = {
  all: ["wines"] as const,
  details: () => [...wineQueryKeys.all, "detail"] as const,
  detail: (wineId: string) =>
    [...wineQueryKeys.details(), wineId] as const,
  searches: () => [...wineQueryKeys.all, "search"] as const,
  search: (query: string) =>
    [...wineQueryKeys.searches(), { query }] as const,
};
```

검색, 상세 조회, cache seed, mutation 후 갱신 코드가 모두 이 factory를
사용한다. key를 사용하기 위해 Client Hook 파일 전체를 import하지 않는다.

## 검색 데이터 흐름

```txt
WineSearchSection input
-> local query state
-> useDebouncedValue(query, 200)
-> useWineSearchQuery(debouncedQuery)
-> entity/wine/api/wine.api.ts
-> GET /api/wines/search?q=...
-> TanStack Query cache
-> WineSearchResultList
```

`useWineSearchQuery`의 책임은 다음으로 제한한다.

- normalized query를 포함한 query key
- `queryFn`
- 빈 검색어일 때 `enabled: false`
- `staleTime`, `retry` 등 캐시 정책

`queryFn`은 TanStack Query가 제공하는 `AbortSignal`을 Entity API 함수에
전달한다. 기존 검색용 `useEffect`, 수동 `AbortController`,
`searchResults`, `isSearching` state는 제거한다.

`useDebouncedValue`의 `useEffect`는 로컬 입력값 지연만 담당한다. 네트워크
요청과 서버 응답 저장에는 관여하지 않는다.

빈 검색어에서는 query를 실행하지 않고 UI가 안내 또는 빈 상태를
렌더링한다.

## 분석 데이터 흐름

```txt
PhotoUploadBox
-> local File ref + preview state
-> 분석 버튼
-> useAnalyzeWineListMutation
-> POST /api/wine-lists/analyze
-> 성공 응답 Wine[]
-> wine detail cache seed
-> Zustand selectedWineIds 교체
-> 사진 영역 닫기
```

분석 진행 상태는 `mutation.isPending`, 오류는 `mutation.error`를 사용한다.
별도 `isAnalyzing` state를 만들지 않는다.

분석 결과가 목록 전체에 영향을 주더라도 현재 P1에는 서버가 소유하는
선택 목록 query가 없다. 따라서 관련 목록을 invalidate하지 않고, 완전한
응답을 받은 각 와인의 detail cache를 `setQueryData`한다.

## 선택 데이터 흐름

### 검색 결과에서 추가

1. 이미 선택된 ID인지 확인한다.
2. 검색 응답에 카드 렌더링에 필요한 완전한 데이터가 있으면 detail cache를
   `setQueryData`한다.
3. Zustand에 ID를 append한다.
4. 중복 ID는 추가하지 않는다.

### 분석 결과로 교체

1. 응답 와인별 detail cache를 채운다.
2. 응답 순서대로 ID 배열을 만든다.
3. Zustand의 선택 ID를 한 번에 교체한다.

### 제거

- Zustand에서 ID만 제거한다.
- detail cache는 즉시 삭제하지 않는다.
- 같은 화면에서 다시 선택할 수 있으므로 Query의 `gcTime` 정책에 맡긴다.

## 로컬 UI 상태

`use-wine-list-select-controller.ts`는 상태 저장소가 아니라 Feature 조합
hook이다.

다음 로컬 상태만 가진다.

- `query`
- `isPhotoSectionOpen`
- `menuImagePreview`
- 실제 `File` ref

다음 값은 저장하지 않고 파생한다.

- `searchResults`
- `selectedWines`
- `isSearching`
- `isAnalyzing`
- `hasSelectedWines`
- `selectedWineIds` 기반 선택 여부

preview URL은 파일 변경 시 이전 URL을 해제하고 unmount cleanup에서도
`URL.revokeObjectURL`을 호출한다.

## Provider 설정

`@tanstack/react-query`를 dependency에 추가한다.

```txt
web/src/app/shared/api/query-client.ts
web/src/app/providers.tsx
web/src/app/layout.tsx
```

`providers.tsx`는 Client Component이며 `QueryClient`와 와인 선택 store를
브라우저 생명주기 동안 한 번만 생성한다. `layout.tsx`는 Server Component를
유지하고 `<Providers>{children}</Providers>`만 조합한다.

와인 선택 store는 Context 기반 Provider로 인스턴스를 주입한다. 이를 통해
다음 단계 라우트에서도 draft를 이어 쓰고 Storybook에서는 Story별로
독립된 store를 사용할 수 있다.

## 컴포넌트 구조

```txt
WineAiPage [Server]
├─ WineListSelectHeader [Server]
└─ WineListSelectPage [Client Boundary]
   ├─ WineMenuPhotoSection
   │  └─ PhotoUploadBox
   ├─ WineSearchSection
   │  └─ WineSearchResultList
   │     └─ WineSearchResultItem
   └─ SelectedWineSection
      └─ SelectedWineCard
```

Feature UI 컴포넌트와 각 Story는 `feature/wine-list-select/ui`에 둔다.
검색 input은 기존 shared `TextInput`을 조합하고, 화면 전용 헤더는
`WineListSelectHeader`로 관리한다.

`SelectedWineSection`과 `다음` 버튼은 선택 ID가 하나 이상일 때만
렌더링한다. P2 라우트가 구현되기 전까지 `다음` 버튼은 비활성화하며
no-op click handler를 두지 않는다.

## Route Handler

```txt
GET  /api/wines/search?q={query}
GET  /api/wines/{wineId}
POST /api/wine-lists/analyze
```

Route Handler의 책임:

- request parameter/form-data 검증
- server-only Entity 함수 호출
- DTO JSON 응답과 HTTP status 반환

Route Handler가 Feature UI, Zustand store, Query Hook을 import하지 않도록
한다. 인증·인가와 입력 검증은 실제 API 전환 후에도 서버에서 다시
수행한다.

## 기존 파일 마이그레이션

| 현재 파일 | 처리 |
|---|---|
| `business/useWineListSelect.ts` | 삭제 후 controller, Query Hook, Zustand store로 책임 분리 |
| `business/wine-list-select.api-model.ts` | Entity API DTO로 이동 |
| `business/wine-list-select.mapper.ts` | `entity/wine/api/wine.mapper.ts`로 이동 |
| `business/wine-list-select.service.ts` | `entity/wine/api/wine.server.ts`로 이동 |
| `client/wine-list-select.client.ts` | `entity/wine/api/wine.api.ts`로 이동 |
| `presentation/wine-list-select.view-model.ts` | `entity/wine/model/wine.type.ts`로 이동 |
| `ui/wine-list-select.props.ts` | Entity 타입을 import하도록 수정 |
| 기존 UI/Story 파일 | 시각 구조 유지, 새 props와 Provider 환경만 반영 |

`business`, `presentation`, `client` 디렉터리는 마이그레이션 완료 후
제거한다.

## Storybook 계획

기존 컴포넌트 Story는 유지하고 다음을 보완한다.

- `.storybook/preview.tsx`에 테스트용 `QueryClientProvider` decorator 추가
- Story별 QueryClient를 분리해 cache 누수 방지
- Provider가 Story별 Zustand store 인스턴스를 생성해 상태 누수 방지
- `WineListSelectPage` Story에서 API 호출을 직접 발생시키지 않도록
  Query cache 또는 request mock으로 상태 구성
- `p1_1`: 빈 선택, 업로드 영역 열림
- `p1_2`: detail cache와 선택 ID를 함께 준비
- 검색 loading/error/empty/success 상태
- 분석 pending/error/success 상태

표현 컴포넌트 Story는 Query/Zustand를 직접 사용하지 않고 args만으로
렌더링한다.

## 구현 순서

1. `@tanstack/react-query` 설치
2. 공통 `QueryClient`와 `Providers` 연결
3. 와인 Entity 타입, DTO, mapper, browser API, server mock 함수 분리
4. 검색/상세/analyze Route Handler를 Entity server 함수에 연결
5. query key factory 작성
6. 검색 Query Hook과 선택 상세 Queries Hook 작성
7. 분석 Mutation Hook 작성
8. detail cache seed helper 작성
9. 선택 ID 전용 Zustand store 작성
10. 검색 입력 전용 `useDebouncedValue` hook 작성
11. controller hook에서 로컬 UI 상태, Query/Mutation, store action 조합
12. `WineListSelectPage`를 새 controller에 연결
13. UI props와 Story의 타입 import를 Entity 기준으로 변경
14. 기존 `business`, `presentation`, `client` 디렉터리 제거
15. Storybook Query Provider와 상태별 Story 보완
16. lint, type check, Storybook test/build, Next production build 실행

## 완료 기준

- `page.tsx`와 `layout.tsx`가 Server Component로 유지된다.
- 초기 데이터가 없는 P1에서는 불필요한 hydration을 사용하지 않는다.
- 검색 결과를 `useState`, `useReducer`, Zustand에 저장하지 않는다.
- 분석 결과를 `useState` 또는 Zustand에 저장하지 않는다.
- 선택 Zustand store에는 와인 객체가 아니라 ID와 순서만 존재한다.
- 검색 로딩/오류는 Query 상태, 분석 로딩/오류는 Mutation 상태를 사용한다.
- `useEffect + fetch` 검색 코드가 제거된다.
- Query key가 배열 factory 한 곳에서 관리된다.
- API 함수는 Entity, Query/Mutation Hook은 Feature에 존재한다.
- Query Hook에 의미 있는 필터링·정렬·UI 상태 변경 로직이 없다.
- 검색/분석 응답을 detail cache에 넣을 때 같은 detail query key를 사용한다.
- Zustand store를 전체 구독하는 코드가 없다.
- 같은 서버 응답을 Query cache와 Zustand에 중복 저장하지 않는다.
- 현재 P1 UI와 `p1_1`, `p1_2` 시각 상태가 유지된다.

## 검증 명령

```bash
cd web
npx tsc --noEmit
npm run build
npm run build-storybook
```

프로젝트에 lint script가 정상 동작하는 경우 `npm run lint`도 실행한다.

## 범위 밖

- 실제 외부 와인 API 연동
- 선택 목록의 서버 저장
- 새로고침 후 선택 목록 복원
- 검색어 URL 공유
- `다음` 버튼 이후 P2 라우팅과 제출 mutation
- 프로젝트 전체를 `src/entities`, `src/features`, `src/views`로 이동하는
  전역 FSD 마이그레이션
