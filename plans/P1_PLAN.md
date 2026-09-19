# P1 데이터 흐름 및 레이어 마이그레이션 계획

> 보관 문서: 이 계획은 구현 당시 계약을 기록한다. 현재 API 대응 설계는 [`/wine/list` 세션 기반 와인 메뉴 추출 설계](./wine-list-enhanced-design-plan.md)를 기준으로 한다.

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

`p1_1`과 `p1_2`는 별도 라우트가 아니라 `/wine/list` 페이지의 상태 차이다.

- `p1_1`: 메뉴판 이미지 업로드 영역이 열려 있고 선택된 와인이 없는 상태
- `p1_2`: 분석 또는 검색으로 선택한 와인이 `WINES` 영역에 표시된 상태

페이지 라우트는 하나만 유지한다.

```txt
web/src/app/wine/list/page.tsx
```

`page.tsx`는 Server Component로 유지하고 화면의 상호작용만
`WineListSelectPage` Client Boundary 아래에서 처리한다.

## 실제 Mysom API 반영 업데이트

`api/mysom-api.md` 기준으로 P1의 실제 백엔드 연동 범위를 다음처럼 수정한다.

### 와인 검색

현재 `mysom-api`에는 와인 이름 검색 API가 없다. 따라서 기존
`GET /api/wines/search` BFF endpoint는 화면 호환을 위해 유지하되, 검색어 validation만
수행하고 항상 빈 배열을 반환한다.

```txt
GET /api/wines/search?q={query}
-> { wines: [] }
```

검색 UI와 TanStack Query hook은 유지할 수 있지만, 실제 백엔드 연동 대상은 아니다. 실제
검색 API가 생기면 이 BFF route에서 백엔드 endpoint로 연결한다.

### 메뉴 이미지 OCR

메뉴 이미지 분석은 기존 mock rich wine 분석이 아니라 실제 OCR API로 연결한다.

```txt
Browser
-> POST /api/wine-lists/analyze
   Content-Type: multipart/form-data
   menuImage: File
-> BFF Route Handler
-> POST http://localhost:8080/v1/wine-pairing/wines/menu-ocr
   Content-Type: image/png | image/jpeg
   Body: image binary
-> { wines: WineMenuOcrExtractItemDto[] }
-> BFF가 type: "db"이고 유효한 id가 있는 DB 후보만 기존 화면 카드 DTO로 매핑
-> { wines: WineDetailDto[] }
```

최신 OCR 응답은 DB 후보의 상세 필드를 포함한다. BFF는 기존 카드 UI와 선택 flow에 맞춰
다음처럼 매핑한다.

- `id`: DB 후보의 백엔드 ID
- `display_name`/`title`: `koreanName ?? name`
- `image_url`: `imagePath`가 있으면 사용하고 없으면 `/ExampleImage.png`
- `rating`: `rating` 문자열을 숫자로 변환할 수 있으면 사용하고, 아니면 `0`
- `price_label`: `wonPrice`가 있으면 원화 표시, 없으면 `dollarPrice` 표시, 둘 다 없으면 `가격 정보 없음`
- `recommendation_text`: 원문명, `country`, `region`, `category`, `grape` 등 사용 가능한 상세 필드를 조합

분석 mutation이 pending인 동안 업로드한 사진 영역 전체에 primary 색상 로딩 스피너를
오버레이하고 파일 재선택과 중복 분석 요청을 막는다.

허용 이미지 타입은 실제 백엔드와 맞춰 `image/png`, `image/jpeg`만 사용한다. 기존
`webp`, `heic`, `heif` 허용 계획은 제거한다.

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
| 와인 검색 결과 | 실제 백엔드 미지원, BFF에서 빈 배열 반환 | TanStack Query |
| 메뉴판 분석 결과 | POST 요청 후 OCR JSON으로 수신하는 서버 데이터 | TanStack Query mutation + known wines cache |
| 선택 카드 표시 데이터 | 검색·분석 응답에 포함된 서버 데이터 | TanStack Query known wines cache |
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

검색은 `useQuery`로 처리하되 현재 BFF가 빈 배열을 반환한다. 이미지 분석은
`useMutation`으로 POST 요청의 생명주기를 관리하고, 와인 리스트 결과는 OCR JSON 응답으로
수신한다. 로딩과 오류 상태는 Query/Mutation에서 파생한다.

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

### 3. 선택 카드 데이터는 known wines cache에서 읽는다

검색 결과에서 와인을 선택하거나 OCR 분석이 정상 완료되면 payload에 포함된
완전한 와인 객체를 `known-wines` query key에 ID별로 합친다. 그 후 Zustand의
선택 ID만 변경한다.

```txt
검색 결과 선택
-> known wines cache 갱신
-> selectedWineIds에 ID 추가
-> SelectedWineSection은 선택 ID 순서로 known wines cache에서 카드 데이터 선택

메뉴판 OCR 완료
-> BFF가 fallback 카드 DTO로 변환한 payload를 known wines cache에 갱신
-> selectedWineIds를 분석 결과 ID 순서로 교체
```

명시적인 사용자 이벤트에서 cache와 선택 상태를 갱신하며 `useEffect`로 Query
결과를 Zustand에 동기화하지 않는다. 현재 화면에는 선택 ID 복원 요구가 없고
검색·분석 응답에 카드 데이터가 모두 포함되므로 별도 상세 조회 API와
per-wine detail query는 두지 않는다.

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
│     │  ├─ use-known-wines-query.ts
│     │  └─ use-wine-search-query.ts
│     ├─ lib/
│     │  └─ cache-known-wines.ts
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
│  │  └─ search/route.ts
│  └─ wine-lists/
│     └─ analyze/route.ts
│
└─ wine/
   └─ ai/
      └─ page.tsx
```

## 레이어 책임

### `app/wine/list/page.tsx`

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
- `wine.api.ts`: 검색, OCR 분석 BFF endpoint 호출 함수
- `wine.mapper.ts`: API DTO를 앱의 와인 모델로 변환하는 순수 함수
- `wine-menu-image.server.ts`: BFF Route Handler의 이미지 signature 검증

Entity에는 React hook, 선택 상태, 화면 이벤트 핸들러를 두지 않는다.

### `feature/wine-list-select/api`

와인 선택 use case의 Query/Mutation Hook과 query key를 담당한다.

- 검색 query key와 캐시 정책
- 검색·분석 응답으로 채우는 known wines cache
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
  known: () => [...wineQueryKeys.all, "known"] as const,
  searches: () => [...wineQueryKeys.all, "search"] as const,
  search: (query: string) =>
    [...wineQueryKeys.searches(), { query }] as const,
};
```

검색, known wines cache, mutation 후 갱신 코드가 모두 이 factory를 사용한다.
key를 사용하기 위해 Client Hook 파일 전체를 import하지 않는다.

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

## OCR 분석 데이터 흐름

### 확정된 요구사항

- `useWineListSelectController.handleAnalyze`는 메뉴 이미지 `File`을 BFF에 전송한다.
- 브라우저 요청은 `POST /api/wine-lists/analyze`와 `multipart/form-data`를 사용한다.
- BFF는 파일을 검증한 뒤 실제 백엔드 `POST /v1/wine-pairing/wines/menu-ocr`에 이미지 바이너리를
  전달한다.
- 실제 백엔드 OCR 응답은 SSE가 아니라 JSON이다.
- BFF는 OCR 응답에서 `type: "db"`이고 유효한 ID가 있는 후보만 기존 화면 카드 DTO로 매핑한다.
  `type: "ocr"` 항목은 DTO 방어 목적으로만 고려하고 화면 선택 결과에는 노출하지 않는다.
- 분석 결과 와인 객체는 Zustand에 저장하지 않고 TanStack Query known wines cache에
  반영한다.
- 분석 요청 시작부터 JSON 응답 성공 또는 실패까지를 하나의 mutation 생명주기로
  취급한다.
- mutation이 pending인 동안 사진 미리보기 위에 primary 로딩 스피너 오버레이를 표시한다.

### 흐름

```txt
PhotoUploadBox
-> local File ref + preview state
-> 분석 버튼
-> async handleAnalyze()
-> useAnalyzeWineListMutation.mutateAsync(File)
-> POST /api/wine-lists/analyze
-> BFF에서 이미지 검증
-> POST /v1/wine-pairing/wines/menu-ocr
-> OCR JSON 응답 수신
-> type: "db" + 유효한 id 후보만 필터링
-> BFF fallback DTO mapping
-> Wine[] 확정
-> known wines cache 갱신
-> Zustand selectedWineIds 교체
-> 사진 영역 닫기
```

`handleAnalyze`는 `await mutateAsync(file)` 형태로 분석 작업 완료를 기다린다.
Mutation 함수는 BFF가 OCR JSON 응답을 정상적으로 매핑해 반환했을 때 resolve한다.

분석 진행 상태는 기본적으로 `mutation.isPending`, 오류는
`mutation.error`에서 파생한다. 와인 리스트 payload 자체는 Zustand에 저장하지 않는다.

분석 결과가 목록 전체에 영향을 주더라도 현재 P1에는 서버가 소유하는 선택
목록 query가 없다. 따라서 관련 목록을 invalidate하지 않고, OCR 완료 payload를 known
wines query key에 `setQueryData`로 병합한다.

사용자가 화면을 이탈하거나 새 분석을 시작하면 진행 중인 요청은 가능하면
`AbortController`로 취소한다. 취소는 일반 분석 실패와 구분해 불필요한 오류 메시지를
표시하지 않는다.

## 선택 데이터 흐름

### 검색 결과에서 추가

1. 이미 선택된 ID인지 확인한다.
2. 검색 응답에 카드 렌더링에 필요한 완전한 데이터가 있으면 known wines cache를
   `setQueryData`한다.
3. Zustand에 ID를 append한다.
4. 중복 ID는 추가하지 않는다.

### 분석 결과로 교체

1. OCR 정상 완료 응답 와인을 known wines cache에 채운다.
2. 응답 순서대로 ID 배열을 만든다.
3. Zustand의 선택 ID를 한 번에 교체한다.

### 제거

- Zustand에서 ID만 제거한다.
- known wines cache는 즉시 삭제하지 않는다.
- 같은 화면에서 다시 선택할 수 있으므로 화면 생명주기 동안 유지한다.

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
WineListPage [Server]
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
GET  /api/wines/search?q={query}       # 실제 검색 API 없음. BFF가 빈 배열 반환
POST /api/wine-lists/analyze           # BFF -> /v1/wine-pairing/wines/menu-ocr
```

Route Handler의 책임:

- request parameter/form-data 검증
- 검색 요청은 실제 검색 API가 생기기 전까지 빈 배열 JSON 응답 반환
- 분석 요청은 파일을 검증한 뒤 실제 OCR API로 이미지 바이너리 전달
- OCR 응답에서 `type: "db"` 후보만 선별
- 유효한 DB 후보의 DTO 검증과 fallback 카드 DTO 변환
- 내부 오류의 safe error 변환

Route Handler가 Feature UI, Zustand store, Query Hook을 import하지 않도록
한다. 인증·인가와 입력 검증은 실제 API 전환 후에도 서버에서 다시
수행한다. 백엔드 origin과 token은 브라우저에 직접 노출하지 않는다.

## 최신 OCR API 대응 구현 상세

### 수정 대상 파일

```txt
web/src/app/entity/wine/model/wine.type.ts
web/src/app/api/wine-lists/analyze/route.ts
web/src/app/entity/wine/api/wine.mapper.ts
web/src/app/entity/wine/api/wine.api.ts
web/src/app/feature/wine-list-select/api/use-analyze-wine-list-mutation.ts
web/src/app/feature/wine-list-select/model/use-wine-list-select-controller.ts
```

### `wine.type.ts`

`WineMenuOcrExtractItemDto`를 최신 백엔드 응답에 맞춘다.

```ts
export type WineMenuOcrExtractItemDto = {
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
```

기존 `"OCR" | "DB"`와 `price` 필드는 제거한다. 저장소 값이나 mock fixture도 이 타입을 따라 갱신한다.

### `api/wine-lists/analyze/route.ts`

BFF는 다음 순서로 처리한다.

1. 브라우저 `multipart/form-data` 요청을 검증한다.
2. 파일 확장자보다 실제 magic signature와 MIME을 우선 검증한다.
3. 백엔드에는 `image/png` 또는 `image/jpeg` raw binary body로 전달한다.
4. 백엔드 응답의 `wines`에서 `type === "db"`이고 `id`가 공백이 아닌 항목만 통과시킨다.
5. `id`가 `Number.isSafeInteger(Number(id))`를 만족하지 않으면 페어링 API와 호환되지 않으므로 제외한다.
6. BFF 응답은 기존 화면 DTO `WineDetailDto[]`로 정규화한다.

정규화 규칙:

```ts
display_name = koreanName || name
title = display_name
image_url = imagePath || "/ExampleImage.png"
rating = Number.parseFloat(rating ?? "") || 0
price_label =
  wonPrice != null ? `${formatNumber(wonPrice)}원`
  : dollarPrice != null ? `$${formatNumber(dollarPrice)}`
  : "가격 정보 없음"
recommendation_text = [name !== display_name ? name : null, country, region, category, grape, "DB 와인 후보입니다."].filter(Boolean).join(" · ")
```

백엔드 오류 body는 그대로 전달하지 않는다. `response.status`는 유지하되 메시지는 BFF safe message로 변환한다.

### Query/Mutation 연결

- `analyzeWineList(menuImage)`는 `/api/wine-lists/analyze`만 호출한다.
- `useAnalyzeWineListMutation`은 mutation 생명주기만 담당한다.
- 성공 시 `useWineListSelectController`가 `cacheKnownWines(queryClient, wines)` 후 `replaceWineIds(wines.map((wine) => wine.id))`를 수행한다.
- 분석 응답 원본 DTO는 Zustand나 `useState`에 저장하지 않는다.
- 새 파일 선택 시 이전 분석 오류를 reset하고, 진행 중 요청이 있으면 가능한 경우 abort한다.

### 테스트/검증 포인트

- `type: "db"` 응답만 선택 후보로 변환된다.
- `type: "ocr"` 또는 `id: null` 항목은 BFF 응답에 나오지 않는다.
- `imagePath`, `rating`, `wonPrice`, `dollarPrice`가 있을 때 카드 DTO에 반영된다.
- 가격/평점 필드가 null 또는 파싱 불가여도 fallback으로 정상 렌더링된다.
- 10MiB 초과, 빈 body, 지원하지 않는 MIME은 BFF에서 safe error를 반환한다.

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
- `p1_2`: known wines cache와 선택 ID를 함께 준비
- 검색 loading/error/empty/success 상태
- 분석 pending/error/success/cancelled 상태와 사진 위 primary 스피너 오버레이

표현 컴포넌트 Story는 Query/Zustand를 직접 사용하지 않고 args만으로
렌더링한다.

## 구현 순서

1. `@tanstack/react-query` 설치
2. 공통 `QueryClient`와 `Providers` 연결
3. 와인 Entity 타입, DTO, mapper, browser API 분리
4. 검색/analyze Route Handler를 BFF 계약에 맞게 작성
5. query key factory 작성
6. 검색 Query Hook과 known wines cache Hook 작성
7. 분석 BFF에서 `/v1/wine-pairing/wines/menu-ocr` 바이너리 요청 연결
8. OCR 응답에서 DB 후보만 선별하고 fallback 카드 DTO mapping 작성
9. POST 요청부터 OCR JSON 응답 완료까지 캡슐화한 분석 Mutation Hook 작성
10. known wines cache helper 작성
11. 선택 ID 전용 Zustand store 작성
12. 검색 입력 전용 `useDebouncedValue` hook 작성
13. controller의 `handleAnalyze`를 async/abort 가능한 흐름으로 조합
14. `WineListSelectPage`를 새 controller에 연결
15. UI props와 Story의 타입 import를 Entity 기준으로 변경
16. 기존 `business`, `presentation`, `client` 디렉터리 제거
17. Storybook Query Provider와 분석 상태별 Story 보완
18. lint, type check, Storybook test/build, Next production build 실행

## 완료 기준

- `page.tsx`와 `layout.tsx`가 Server Component로 유지된다.
- 초기 데이터가 없는 P1에서는 불필요한 hydration을 사용하지 않는다.
- 검색 결과를 `useState`, `useReducer`, Zustand에 저장하지 않는다.
- OCR로 수신한 분석 결과를 `useState` 또는 Zustand에 저장하지 않는다.
- 선택 Zustand store에는 와인 객체가 아니라 ID와 순서만 존재한다.
- 검색 로딩/오류는 Query 상태를 사용한다.
- 분석 Mutation은 BFF가 OCR 응답을 매핑한 JSON 응답을 반환하면 성공한다.
- `type: "ocr"` 항목은 BFF 응답과 선택 결과에 노출되지 않는다.
- 분석 pending 동안 사진 영역 위에 primary 로딩 스피너가 표시된다.
- OCR 완료 payload는 known wines query key에 저장한다.
- 화면 이탈 또는 새 분석 시작 시 기존 분석 요청을 취소한다.
- 취소와 서버 오류를 구분해 UI 상태를 처리한다.
- `useEffect + fetch` 검색 코드가 제거된다.
- Query key가 배열 factory 한 곳에서 관리된다.
- API 함수는 Entity, Query/Mutation Hook은 Feature에 존재한다.
- Query Hook에 의미 있는 필터링·정렬·UI 상태 변경 로직이 없다.
- 검색/분석 응답을 같은 known wines query key에 저장한다.
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

- 백엔드의 실제 이미지 OCR 엔진 구현
- 선택 목록의 서버 저장
- 새로고침 후 선택 목록 복원
- 검색어 URL 공유
- `다음` 버튼 이후 P2 라우팅과 제출 mutation
- 프로젝트 전체를 `src/entities`, `src/features`, `src/views`로 이동하는
  전역 FSD 마이그레이션
