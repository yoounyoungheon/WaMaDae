# P2 테이블 키워드 선택 페이지 구현 계획

> 현재 `/wine/keywords`는 테이블 키워드 선택 페이지가 아니라 메뉴 카테고리 추천/선택 화면으로 구현되어 있다.
> 최신 구현 계획은 `plans/wine-keywords-menu-category-recommendation-plan.md`를 기준으로 한다.
> 이 문서는 과거 P2 디자인/키워드 선택 아이디어 참고용으로만 유지한다.

## 1. 기준

- 디자인: `designs/p2.png`
- API 명세: `api/table-keyword-select.md`
- BFF mock: `web/src/app/api/table-keywords/route.ts`
- 적용 가이드:
  - `data-flow-layering`
  - `bff-api-gateway`
  - `rsc-rendering`
  - `rcc-rendering`
  - `storybook-authoring`
  - `style-implementation`

이 문서는 테이블 키워드 선택 페이지 한 개만 대상으로 한다.

## 2. 페이지 범위

제안 라우트:

```text
/wine/keywords
```

페이지 제목:

```text
오늘의 테이블 키워드 선택
```

페이지 역할:

1. 서버에서 선택 가능한 테이블 키워드 목록을 조회한다.
2. 사용자가 키워드를 복수 선택하거나 선택 해제한다.
3. 현재 선택 개수를 표시한다.

P1의 `/wine/list` 페이지에서 `다음` 버튼을 누르면 이 페이지로 이동하도록 연결한다.

## 3. 디자인 분석

### 화면 구조

```text
Page
├─ PageHeader
├─ Scrollable Content
│  ├─ 안내 제목
│  ├─ 안내 설명
│  ├─ 선택 개수 요약
│  └─ 키워드 3열 Grid
```

### 주요 시각 요소

- 상단 흰색 헤더에 뒤로가기 아이콘과 페이지 제목을 표시한다.
- 본문은 `background-03` 계열의 연한 회색 배경을 사용한다.
- 안내 제목은 두 줄을 허용하고 설명 문구와 명확한 타이포그래피 계층을 둔다.
- 선택 개수는 보라색 테두리의 단일 행 박스로 표시한다.
- 키워드는 모바일 기준 3열 정사각형 카드 Grid로 표시한다.
- 미선택 카드는 흰색 배경, 회색 테두리, 약한 그림자를 사용한다.
- 선택 카드는 보라색 배경과 흰색 텍스트를 사용한다.
- 선택 카드 오른쪽 위에는 흰색 원형 체크 표시를 배치한다.
- 키보드 포커스는 보라색 외곽선으로 명확히 표시한다.
- 본문만 스크롤된다.

### 반응형 기준

- 현재 프로젝트의 350px 앱 컨테이너를 기준으로 구현한다.
- Grid는 `grid-cols-3`과 `gap`을 사용하고 카드 고정 폭을 직접 계산하지 않는다.
- 카드는 `aspect-square` 또는 동일한 최소 높이를 사용한다.
- 긴 키워드 이름은 두 줄까지 허용하되 카드 높이는 동일하게 유지한다.
- 하단 영역은 `env(safe-area-inset-bottom)`을 고려한다.

## 4. 상태 분류

| 상태 | 출처 | 관리 방식 |
| --- | --- | --- |
| 테이블 키워드 목록 | 서버 | TanStack Query |
| 선택된 키워드 ID와 순서 | 다단계 사용자 draft | Zustand |
| 선택 개수 | 선택 ID에서 계산 | 파생 값 |
| 조회 loading/error | Query에서 파생 | `isPending`, `error` |

규칙:

- API 응답 목록을 `useState` 또는 Zustand에 복제하지 않는다.
- Zustand에는 키워드 객체가 아닌 ID만 저장한다.
- 선택 개수는 별도 상태로 저장하지 않는다.
- URL 공유나 새로고침 복원 요구가 없으므로 `searchParams`는 사용하지 않는다.

제안 store:

```ts
type TableKeywordSelectionState = {
  selectedKeywordIds: string[];
  toggleKeyword: (keywordId: string) => void;
  reset: () => void;
};
```

초기 선택값은 빈 배열이다. 디자인의 `2개 선택됨` 상태는 Storybook 시나리오로
재현하며 실제 페이지의 기본값으로 하드코딩하지 않는다.

## 5. RSC/RCC 경계

```text
TableKeywordPage [Server]
├─ PageHeader [Server]
└─ HydrationBoundary
   └─ TableKeywordSelectPage [Client]
      ├─ SelectionSummary
      ├─ TableKeywordGrid
      │  └─ TableKeywordCard
```

### Server Component

`web/src/app/wine/keywords/page.tsx`

- `page.tsx`는 Server Component로 유지한다.
- 페이지 metadata와 정적 헤더 조합을 담당한다.
- 초기 키워드 목록을 서버에서 prefetch한다.
- `dehydrate`와 `HydrationBoundary`로 동일 Query cache를 Client Component에 전달한다.
- 서버에서 same-origin BFF를 다시 HTTP 호출하지 않는다.
- 서버 전용 mock 조회 함수를 직접 사용하고, 브라우저 재조회만 BFF를 경유한다.

### Client Component

`TableKeywordSelectPage`만 Client Boundary로 둔다.

- Query cache 구독
- 키워드 선택/해제
- 선택 개수 계산

표현 전용 하위 컴포넌트는 hook이 필요하지 않으면 Server/Client 지시어를
추가하지 않고 상위 Client Boundary 아래에서 사용한다.

## 6. API 및 데이터 계층

### API 계약

```http
GET /api/table-keywords
```

응답:

```ts
type GetTableKeywordsResponse = {
  keywords: TableKeywordDto[];
};
```

### Entity

신규 경로:

```text
web/src/app/entity/table-keyword/
├─ model/table-keyword.type.ts
└─ api/
   ├─ table-keyword.api.ts
   ├─ table-keyword.mapper.ts
   └─ table-keyword.server.ts
```

책임:

- `table-keyword.type.ts`
  - `TableKeywordDto`
  - 앱 모델 `TableKeyword`
- `table-keyword.mapper.ts`
  - `display_order`를 `displayOrder`로 변환
- `table-keyword.api.ts`
  - 브라우저에서 `GET /api/table-keywords` 호출
  - 안전한 오류 메시지 변환
- `table-keyword.server.ts`
  - 현재 Route Handler 안의 mock 목록을 server-only 함수로 이동
  - `display_order` 오름차순 반환
  - 실제 백엔드 연동 시 교체되는 경계

앱 모델:

```ts
type TableKeyword = {
  id: string;
  name: string;
  emojiPath: string;
  displayOrder: number;
};
```

### BFF Route Handler

기존 파일:

```text
web/src/app/api/table-keywords/route.ts
```

수정 계획:

- Route Handler 내부에 있는 mock 배열과 DTO 정의를 Entity server/model로 이동한다.
- Route Handler는 server-only 조회 함수 호출과 안전한 JSON 응답만 담당한다.
- 인증 요구가 생기면 Route Handler에서 검증한다.
- 백엔드 origin과 token은 브라우저에 노출하지 않는다.

### Query

신규 경로:

```text
web/src/app/feature/table-keyword-select/api/
├─ table-keyword-query-keys.ts
└─ use-table-keywords-query.ts
```

Query key:

```ts
const tableKeywordQueryKeys = {
  all: ["table-keywords"] as const,
  list: () => [...tableKeywordQueryKeys.all, "list"] as const,
};
```

정책:

- 서버 prefetch와 Client Query Hook이 동일한 key를 사용한다.
- 키워드 목록은 변경 빈도가 낮으므로 긴 `staleTime`을 사용한다.
- Query Hook은 `queryKey`, `queryFn`, `staleTime`만 담당한다.
- 정렬과 DTO 변환은 Entity 계층에서 완료한다.

## 7. 데이터 흐름

### 초기 조회

```text
page.tsx [Server]
→ QueryClient.prefetchQuery
→ table-keyword.server.ts
→ DTO mapping
→ dehydrate
→ HydrationBoundary
→ useTableKeywordsQuery
→ 추가 브라우저 요청 없이 Grid 렌더링
```

### 브라우저 재조회

```text
useTableKeywordsQuery
→ table-keyword.api.ts
→ GET /api/table-keywords
→ Route Handler
→ table-keyword.server.ts
→ DTO JSON
→ mapper
→ Query cache
```

### 선택

```text
TableKeywordCard change
→ toggleKeyword(id)
→ selectedKeywordIds 갱신
→ 선택 카드 스타일 변경
→ 선택 개수 재계산
```

## 8. Feature UI 설계

신규 경로:

```text
web/src/app/feature/table-keyword-select/
├─ api/
├─ model/
│  ├─ table-keyword-selection.store.ts
│  ├─ table-keyword-selection-provider.tsx
│  └─ use-table-keyword-select-controller.ts
└─ ui/
   ├─ TableKeywordSelectPage.tsx
   ├─ TableKeywordSelectPage.stories.tsx
   ├─ TableKeywordGrid.tsx
   ├─ TableKeywordGrid.stories.tsx
   ├─ TableKeywordCard.tsx
   ├─ TableKeywordCard.stories.tsx
   ├─ SelectionSummary.tsx
   └─ table-keyword-select.props.ts
```

### `TableKeywordSelectPage`

- 페이지 본문과 하단 액션 영역을 조합한다.
- Query loading/error/empty/success 상태를 분기한다.
- 선택 상태와 이벤트를 controller에서 받아 하위 컴포넌트에 전달한다.
- 본문은 `min-h-0 flex-1 overflow-y-auto`로 스크롤한다.
- 하단 액션은 `shrink-0`과 상단 border를 사용해 화면 아래에 유지한다.

### `TableKeywordGrid`

- `grid grid-cols-3` 구조를 사용한다.
- API의 정렬 순서를 그대로 표현한다.
- Grid 자체는 선택 상태를 보관하지 않는다.

### `TableKeywordCard`

- feature 전용 도메인 컴포넌트로 작성한다.
- 선례인 `wine-list-select/ui/SelectedWineCard`처럼 shared `Card`에 의존하지
  않고 자체 root element로 구현한다. `SelectedWineCard`도 도메인 카드를 공용
  `Card` 위에 짓지 않고 자체 `article` + 자체 className으로 구성한다.
- root는 `label` element로 두고 숨겨진 native checkbox와 연결해 선택
  semantics를 유지한다.
- 미선택 카드의 border, radius, background, shadow는 디자인 토큰 기반 className을
  직접 작성한다. 한 줄짜리 컨테이너 스타일을 위해 공용 `Card`와 그 하위
  shadcn `Card`까지 `asChild`로 개조하지 않는다.
- 숨겨진 checkbox의 `peer-checked`, `peer-focus-visible` 상태를 `label` root
  스타일에 연결한다.
- 공개 props는 `keyword`, `isSelected`, `onToggle` 중심으로 제한한다.
- `emojiPath`는 `next/image`로 렌더링하고 명시적인 크기를 제공한다.
- SVG를 불러오지 못해도 이름 텍스트로 의미를 파악할 수 있어야 한다.
- 선택 여부를 색상만으로 전달하지 않고 체크 아이콘을 함께 표시한다.
- `focus-visible` 상태에 보라색 outline/ring을 제공한다.

### `SelectionSummary`

- `selectedCount`만 입력받는다.
- 문구는 `${selectedCount}개 선택됨`으로 생성한다.

## 9. `shared/ui` 재사용

반드시 재사용:

- `shared/ui/molecule/page-header`
- `shared/ui/atom/button`

사용 방식:

- `PageHeader`
  - title: `오늘의 테이블 키워드 선택`
  - `routeBackPath: "/wine/list"` (prop 이름은 `routeBackPath`이며 `backPath`가
    아니다. 뒤로가기 아이콘과 `aria-label="뒤로가기"`는 컴포넌트에 내장되어 있다)
- `Button`
  - variant: `solid`
  - type: `primary`
  - radius: `lg`
  - `htmlType: "button"`
  - 우측 화살표 아이콘은 children 조합으로 추가
  - P1 `WineListSelectPage`의 하단 고정 버튼 패턴
    (`h-11 w-full rounded-lg`, `disabled` 처리)을 그대로 따른다.

### `shared/ui/Card`는 재사용/확장하지 않는다

검토 결과 키워드 카드가 공용 `Card`에서 실제로 물려받을 수 있는 것은
컨테이너 className 한 줄(`rounded-xl border bg-white shadow`)뿐이며,
`CardHeader/Title/Content/Footer`의 `p-6` 구조는 전혀 사용하지 않는다.

반면 `label`을 root로 렌더링하려면 공용 `Card`와 그 하위 `shadcn/card`(현재
`Slot` 없는 하드코딩 `div`) **두 레이어**를 `asChild`로 개조해야 하고, 이는
기존 모든 Card 사용처에 회귀 위험을 추가한다. 또한 코드베이스 선례
(`SelectedWineCard`)는 도메인 카드를 공용 `Card` 위에 짓지 않는다.

따라서 공용 `Card`에 `asChild`를 추가하지 않고, `TableKeywordCard`가 자체
`label` root와 className으로 컨테이너 스타일·선택 표현을 담당한다.

## 10. 선택 정책

초기 정책:

- 복수 선택을 허용한다.
- 동일 키워드는 중복 선택할 수 없다.
- 선택된 카드를 다시 누르면 선택 해제한다.
- 최대 선택 개수는 API와 요구사항에 정의되어 있지 않으므로 제한하지 않는다.
- 현재 기획에서 `/wine/keywords` 이후 단계는 제거되어 완료 버튼이나 후속 제출 API를
  연결하지 않는다.

## 11. Provider 구성

P2 선택값이 다음 단계에서도 필요하지만, 이 draft는 `/wine/*` 플로우에서만
의미가 있으므로 전역 `Providers`에 두지 않는다. 전역에 단계별 Provider를 계속
쌓으면 `providers.tsx`가 비대해지고 `/` 같은 무관한 라우트까지 감싸게 된다.

대신 `app/wine/layout.tsx` 세그먼트 layout에서 플로우 Provider를 제공한다.
App Router는 같은 layout을 공유하는 형제 페이지(`/wine/list` ↔ `/wine/keywords`)
이동 시 layout 인스턴스를 유지하므로 단계 간 선택값이 보존되고, 플로우를 벗어나면
layout이 언마운트되며 draft가 초기화된다.

```text
RootLayout
└─ Providers (QueryClientProvider)        # 전역은 QueryClient만
   └─ ...
      └─ app/wine/layout.tsx              # 플로우 세그먼트 layout
         └─ WineListSelectionProvider
            └─ TableKeywordSelectionProvider
               └─ {/wine/* page}
```

새로운 단계가 추가되면 전역 Providers가 아니라 이 세그먼트 layout에 Provider를 더한다.

Storybook에서도 Story별 store 인스턴스를 분리해 선택 상태 누수를 방지한다.

## 12. 상태별 화면

반드시 구현할 상태:

- loading
  - Grid 영역에 고정 크기 skeleton 또는 loading 안내 표시
- error
  - 안전한 오류 메시지와 재시도 버튼 표시
- empty
  - 선택 가능한 키워드가 없다는 안내 표시
- success
  - 선택 개수 반영, 선택 카드 체크 표시

## 13. Storybook 계획

Story title:

```text
Feature/table-keyword-select/<ComponentName>
```

필수 Story:

- `TableKeywordCard`
  - `Default`
  - `Selected`
  - `FocusVisible`
  - `LongName`
- `TableKeywordGrid`
  - `Default`
  - `WithSelectedItems`
  - `Empty`
- `TableKeywordSelectPage`
  - `Default`
  - `TwoSelected`
  - `Loading`
  - `Error`
  - `Empty`

페이지 Story wrapper는 디자인과 유사한 모바일 viewport를 재현하되 컴포넌트의
레이아웃 책임을 대신하지 않는다.

## 14. 접근성

- 모든 키워드 카드는 키보드로 포커스하고 선택할 수 있어야 한다.
- checkbox의 접근 가능한 이름은 키워드 `name`을 사용한다.
- 선택 상태는 native `checked` 또는 `aria-checked`로 노출한다.
- 체크 아이콘은 장식이면 `aria-hidden` 처리한다.
- 선택 개수 변경은 필요하면 `aria-live="polite"`로 알린다.
- SVG 이미지에는 키워드 이름과 중복되지 않는 적절한 alt 정책을 적용한다.

## 15. 구현 순서

1. `TableKeyword` Entity 타입과 mapper 작성
2. Route Handler mock 데이터를 server-only Entity 함수로 이동
3. 브라우저 BFF API 함수 작성
4. Query key와 Query Hook 작성
5. 선택 ID Zustand store와 Provider 작성
6. root/Storybook Provider에 선택 Provider 연결
7. `TableKeywordCard`(자체 `label` root)와 Story 작성
8. `TableKeywordGrid`, `SelectionSummary`와 Story 작성
9. controller 작성
10. `TableKeywordSelectPage`와 상태별 Story 작성
11. `/wine/keywords/page.tsx` Server Component와 hydration 구현
12. P1 `다음` 버튼을 P2 라우트에 연결
13. 구현 후 `docs/table-keyword-select.md` 작성

## 16. 검증

```bash
cd web
npx tsc --noEmit
npm run build
npm run build-storybook
```

추가 확인:

- `GET /api/table-keywords` 응답이 API 문서와 일치하는지 확인
- 서버 렌더 후 브라우저에서 같은 목록을 중복 요청하지 않는지 확인
- 키보드 선택과 focus-visible 확인
- 0개/복수 선택 시 카운트와 선택 표시 확인
- 긴 텍스트와 작은 viewport에서 Grid overflow 확인
- SVG 경로가 모두 정상 응답하는지 확인

Storybook은 현재 요구 Node.js 버전을 충족한 환경에서 실행한다.

## 17. 완료 기준

- `page.tsx`가 Server Component로 유지된다.
- 초기 키워드 목록이 서버에서 준비되고 hydration으로 전달된다.
- 브라우저 API 호출은 `/api/table-keywords` BFF만 사용한다.
- 서버 키워드 목록을 Zustand나 `useState`에 복제하지 않는다.
- Zustand에는 선택된 키워드 ID만 존재한다.
- 선택 개수를 별도 상태로 저장하지 않는다.
- 기존 `PageHeader`, `Button`을 재사용하고, 공용 `Card`는 개조하지 않는다.
- 미선택, 선택, focus, loading, error, empty 상태가 제공된다.
- 키보드와 스크린 리더로 선택 상태를 확인할 수 있다.
- 디자인의 3열 Grid 구조가 유지된다.
- 구현 결과가 `docs/table-keyword-select.md`에 페이지 단위로 정리된다.
