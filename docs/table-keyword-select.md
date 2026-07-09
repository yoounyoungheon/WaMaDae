# TableKeywordSelectPage 구조 및 데이터 흐름

`/wine/keywords` 화면(오늘의 테이블 키워드 선택)의 **UI → 비즈니스 로직 → API**
처리 흐름과 레이어 구조를 정리한 문서다. 기준 컴포넌트는
`feature/table-keyword-select/ui/TableKeywordSelectPage.tsx`이다.

이 문서의 코드 경로는 별도 표기가 없으면 `web/src/app/`을 기준으로 한다.
계획 문서가 아니라 현재 구현을 설명하며, 코드 변경 시 함께 갱신한다.
설계 배경은 `plans/P2_PLAN.md`, API 계약은 `api/table-keyword-select.md`를 참고한다.

## 1. 한눈에 보기

### 라우트와 RSC/RCC 경계

```text
wine/keywords/page.tsx            [Server Component]
├─ PageHeader                     [Server]  title + routeBackPath="/wine/ai"
└─ HydrationBoundary              prefetch 캐시 전달
   └─ TableKeywordSelectPage      [Client]  "use client"
      ├─ SelectionSummary         선택 개수 표시
      ├─ TableKeywordGrid         3열 grid
      │  └─ TableKeywordCard      label root + 숨겨진 checkbox
```

- `page.tsx`는 Server Component로 유지하고, 서버에서 키워드 목록을 prefetch한 뒤
  `dehydrate` / `HydrationBoundary`로 클라이언트에 전달한다.
- 상호작용이 필요한 `TableKeywordSelectPage`만 Client Boundary로 둔다.
- 표현 전용 하위 컴포넌트(`TableKeywordGrid`, `TableKeywordCard`,
  `SelectionSummary`)는 별도 `"use client"` 지시어 없이 상위 Client Boundary
  아래에서 사용한다.

## 2. 상태 관리

| 상태 | 출처 | 관리 방식 | 위치 |
| --- | --- | --- | --- |
| 테이블 키워드 목록 | 서버 | TanStack Query | `useTableKeywordsQuery` |
| 선택된 키워드 ID | 다단계 사용자 draft | Zustand | `table-keyword-selection.store.ts` |
| 선택 개수 | 선택 ID에서 계산 | 파생 값 | controller |
| loading/error | Query에서 파생 | `isPending`, `isError` | controller |

- 서버 키워드 목록을 `useState`나 Zustand에 복제하지 않는다.
- Zustand에는 키워드 객체가 아닌 ID만 저장한다(`selectedKeywordIds: string[]`).
- 선택 개수는 별도 상태로 저장하지 않고 controller에서 파생한다.
- 선택 store는 전역 `Providers`가 아니라 `app/wine/layout.tsx` 세그먼트 layout에서
  `WineListSelectionProvider` → `TableKeywordSelectionProvider` 순으로 제공한다.
  같은 layout을 공유하는 `/wine/ai` ↔ `/wine/keywords` 이동 간 layout 인스턴스가
  유지되어 단계 간 선택값이 보존되고, 플로우를 벗어나면 draft가 초기화된다.
  전역 Providers에는 `QueryClientProvider`만 남겨 페이지 증가에도 비대해지지 않게 한다.

## 3. 데이터 계층

```text
entity/table-keyword/
├─ model/table-keyword.type.ts   TableKeyword(앱 모델) / TableKeywordDto(snake_case)
└─ api/
   ├─ table-keyword.server.ts    server-only mock, display_order 오름차순 DTO 반환
   ├─ table-keyword.mapper.ts    display_order → displayOrder 변환
   └─ table-keyword.api.ts       브라우저 GET /api/table-keywords + 안전한 오류 메시지

feature/table-keyword-select/api/
├─ table-keyword-query-keys.ts   { all: ["table-keywords"], list: () => [...all,"list"] }
└─ use-table-keywords-query.ts   queryKey/queryFn/staleTime만 담당(긴 staleTime)
```

- 정렬과 DTO→모델 변환은 Entity 계층에서 끝내고, Query Hook은 캐시 정책만 담당한다.
- BFF Route Handler(`api/table-keywords/route.ts`)는 server-only 조회 함수 호출과
  안전한 JSON 응답만 담당한다. mock 데이터·DTO 정의는 Entity로 이동했다.

## 4. 데이터 흐름

### 초기 조회 (서버)

```text
page.tsx
→ QueryClient.prefetchQuery(list())
→ getTableKeywords()           (server-only, DTO 정렬)
→ map(mapTableKeywordDto)      (TableKeyword[])
→ dehydrate → HydrationBoundary
→ TableKeywordSelectPage가 동일 key로 즉시 렌더 (브라우저 재요청 없음)
```

서버는 same-origin BFF를 다시 HTTP 호출하지 않고 server-only 함수를 직접 사용한다.

### 브라우저 재조회

```text
useTableKeywordsQuery
→ fetchTableKeywords()
→ GET /api/table-keywords
→ Route Handler → getTableKeywords()
→ DTO JSON → mapTableKeywordDto → Query cache
```

### 선택

```text
TableKeywordCard 체크박스 change
→ onToggle(id) → toggleKeyword(id)
→ selectedKeywordIds 갱신
→ 카드 has-[:checked] 스타일 변경 + 선택 개수 재계산
```

## 5. 상태별 화면

`TableKeywordSelectPage`는 안내 제목·설명을 항상 렌더하고, 본문 영역을 분기한다.

- **loading** (`isPending`): 선택 요약·3열 grid 자리에 고정 크기 skeleton 표시.
- **error** (`isError`): `role="alert"` 박스에 안전한 오류 메시지 + `다시 시도` 버튼.
- **empty** (성공·키워드 0개): 선택 가능한 키워드가 없다는 안내 표시.
- **success**: `SelectionSummary` + `TableKeywordGrid` 렌더.

본문은 `min-h-0 flex-1 overflow-y-auto`로 스크롤한다.

## 6. `shared/ui` 재사용

- `PageHeader`(`molecule/page-header`): `title`, `routeBackPath="/wine/ai"`.
- `Button`(`atom/button`): 오류 상태의 다시 시도 액션에 사용한다.

`TableKeywordCard`는 공용 `Card`를 재사용하거나 개조하지 않는다. 선례인
`SelectedWineCard`처럼 자체 `label` root와 className으로 컨테이너 스타일을 작성한다.
공용 `Card`에서 실제 재사용 가능한 것은 컨테이너 className 한 줄뿐이고, `label`을
root로 만들려면 `Card`와 그 하위 shadcn `Card` 두 레이어를 `asChild`로 개조해야 하므로
재사용 대신 자체 구현을 선택했다. (`plans/P2_PLAN.md` §9 참고)

## 7. 선택 카드 구현과 접근성

`TableKeywordCard`는 CSS 상태 패턴으로 선택 표현을 구성한다.

- root `label` 안에 `sr-only` native checkbox를 두고, `checked`/`onChange`로 제어한다.
- 선택 표현: `has-[:checked]`(컨테이너 배경/테두리), `group-has-[:checked]`(텍스트
  색상, 체크 아이콘 표시).
- 포커스 표현: `has-[:focus-visible]`로 보라색 outline을 제공한다.
- 접근 가능한 이름은 `label`이 감싼 키워드 `name` 텍스트로 제공한다.
- 이모지 이미지는 장식이므로 `alt=""` + `aria-hidden`, 의미는 이름 텍스트가 전달한다.
- 체크 아이콘은 `aria-hidden`, 선택 개수는 `aria-live="polite"`로 알린다.
- 색상만으로 선택을 전달하지 않고 체크 아이콘을 함께 표시한다.

## 8. 라우트 연결

- P1 `/wine/ai`의 `다음` 버튼은 선택이 있을 때 `asChild` + `Link`로
  `/wine/keywords`로 이동한다.
- 현재 기획에서 `/wine/keywords` 이후 단계는 제거되어 추가 라우트 이동 버튼을 두지 않는다.

## 9. Storybook

- `Feature/table-keyword-select/TableKeywordCard`: `Default`, `Selected`,
  `FocusVisible`(`userEvent.tab()`으로 키보드 포커스 재현), `LongName`.
- `Feature/table-keyword-select/TableKeywordGrid`: `Default`(상호작용),
  `WithSelectedItems`, `Empty`.
- `Feature/table-keyword-select/TableKeywordSelectPage`: `Default`, `TwoSelected`,
  `Loading`, `Error`, `Empty`. Story별 `QueryClient`와 선택 store 인스턴스를
  분리하고, `beforeEach`로 `/api/table-keywords` fetch를 상태별로 스텁한다.

## 10. 검증

```bash
cd web
npx tsc --noEmit
npm run build
npm run build-storybook
```

- 위 세 명령 통과.
- `/wine/keywords`는 정적 prerender로 생성되어 서버 prefetch가 빌드 시 동작함을 확인.
- 브라우저 호출은 `/api/table-keywords` BFF만 사용하고, hydration으로 초기 렌더 후
  중복 요청이 발생하지 않는다.
