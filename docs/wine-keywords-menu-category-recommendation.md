# `/wine/keywords` 메뉴 카테고리 추천 결과 흐름

`/wine/keywords`(추천 메뉴) 화면에서 유지된 선택 와인으로 메뉴 카테고리 추천을
동기 조회하고 결과를 표시하는 흐름을 정리한 문서다. 기준 컴포넌트는
`feature/menu-category-recommendation-result/ui/MenuCategoryRecommendationPage.tsx`이다.

이 문서의 코드 경로는 별도 표기가 없으면 `web/src/app/`을 기준으로 한다.
API 계약은 `api/mysom-wine-pairing.md`의
`POST /v1/wine-pairing/menu-category/recommend`를 참고한다.

> 이전 설계는 `?id=` 기반의 비동기 작업 조회(polling)였으나, 동기 추천 API로 전환하며
> URL의 추천 작업 ID 개념이 사라졌다. 결과 화면은 이전 단계(`/wine/list`의 `다음` 버튼)에서
> **sessionStorage에 스냅샷한 선택 payload**를 읽어 추천을 즉시 조회한다. WebView 리로드나
> 뒤로가기 후에도 스냅샷이 남아 결과가 복원된다. 스냅샷 없이(예: 새 세션에서 `/wine/keywords`에
> 바로 진입) 열면 "선택된 와인이 없어요" 상태를 보여준다.

## 1. 한눈에 보기

```text
wine/keywords/page.tsx                     [Server Component]
├─ PageHeader                              [Server]  title + routeBackPath="/wine/list"
└─ MenuCategoryRecommendationPage          [Client]  "use client"
   ├─ AI 추천 메뉴 카테고리 섹션
   │  ├─ "마이쏨 AI가 추천하는 메뉴 카테고리에요."
   │  ├─ RecommendationStatePanel           선택 없음 / pending / error / empty 패널
   │  └─ MenuCategoryList                   성공 시 AI 추천 카테고리 리스트
   │     └─ MenuCategoryItem
   └─ 기본 메뉴 카테고리 섹션
      └─ DefaultMenuCategoryGrid            프론트엔드 상수 기반 3열 메뉴 카드 Grid
         └─ DefaultMenuCategoryCard
```

- `page.tsx`는 Server Component로 유지하고, 상호작용/조회가 필요한 결과 화면만
  Client Boundary로 둔다. 선택 상태가 클라이언트 draft이므로 서버 prefetch는 하지 않는다.
- 결과 화면은 두 섹션으로 구성한다. 상단은 AI 추천 결과, 하단은 기존 메뉴 리스트를
  프론트엔드 상수로 렌더링한다.

## 2. 상태 관리

| 상태 | 출처 | 관리 방식 | 위치 |
| --- | --- | --- | --- |
| 추천 요청 body | `다음` 버튼이 저장한 스냅샷 | sessionStorage | `useStoredMenuCategoryRecommendationRequest` |
| 추천 결과(카테고리) | 서버 | TanStack Query | `useMenuCategoryRecommendationsQuery` |
| 기본 메뉴 카테고리 목록 | 프론트엔드 상수 | module constant | `DEFAULT_MENU_CATEGORIES` |
| 선택된 메뉴 카테고리 이름 | 현재 화면 임시 선택 | `useState` | `MenuCategoryRecommendationPage` |
| 오류 메시지 | BFF safe error | Query `error` | UI |

서버 응답을 `useState`나 Zustand에 복제하지 않는다. 결과 화면은 선택 store(Zustand)나
known wines 캐시에 직접 의존하지 않고, sessionStorage 스냅샷만 읽어 이전 단계와 분리돼 있다.
스냅샷은 서버 렌더에서 읽을 수 없으므로 hydration 이후 클라이언트에서 한 번 읽고(`isHydrated`),
그 전에는 로딩 패널을 보여줘 hydration mismatch와 빈 상태 깜빡임을 막는다.
하단 기본 메뉴 카테고리는 서버 상태가 아니므로 Query, Zustand, `useState`에 저장하지 않고
`feature/menu-category-recommendation-result/model/default-menu-categories.ts`의 상수에서 직접 읽는다.
사용자가 선택한 서버 추천/기본 메뉴 카테고리 이름만 화면 내부 임시 상태로 `useState`에 저장한다.
서버 추천 결과와 기본 메뉴 목록에 같은 이름이 있으면 같은 카테고리로 보고 중복 선택 개수로 세지 않는다.

## 3. 데이터 흐름

```text
/wine/list 다음 클릭
-> buildMenuCategoryRecommendationRequest(selectedWines)
-> saveMenuCategoryRecommendationRequest(request)  [sessionStorage 스냅샷]
-> router.push("/wine/keywords")

/wine/keywords
-> useStoredMenuCategoryRecommendationRequest()  [hydration 후 sessionStorage 읽기]
-> useMenuCategoryRecommendationsQuery(request)
-> entity fetchMenuCategoryRecommendations() → fetch POST /api/wine-pairing/menu-category/recommend
-> BFF 검증 → server-only recommendMenuCategories()
-> POST /v1/wine-pairing/menu-category/recommend  (동기)
-> menuCategories → categories: string[]
-> 상단 AI 추천 MenuCategoryList 렌더링

DEFAULT_MENU_CATEGORIES
-> 하단 기본 DefaultMenuCategoryGrid 렌더링
```

## 4. 계층별 책임

- **Entity** `entity/menu-category-recommendation/`
  - `model/menu-category-recommendation.type.ts`: 요청 body / 응답 DTO 타입
  - `lib/build-menu-category-recommendation-request.ts`: `Wine[]` → 요청 순수 변환
  - `lib/recommendation-request-storage.ts`: sessionStorage 스냅샷 저장/복원/검증
  - `api/menu-category-recommendation.api.ts`: 브라우저 BFF 호출
  - `api/menu-category-recommendation.mapper.ts`: `menuCategories` → `string[]`
  - `api/menu-category-recommendation.server.ts`: server-only 백엔드 호출(`recommendMenuCategories`)
- **Feature** `feature/menu-category-recommendation-result/`
  - `api/menu-category-recommendation-query-keys.ts`: 요청 wines 기반 배열 key factory
  - `api/use-menu-category-recommendations-query.ts`: 동기 추천 query
  - `lib/use-stored-recommendation-request.ts`: sessionStorage 스냅샷 hydration hook
  - `model/default-menu-categories.ts`: 하단에 노출할 기존 메뉴 카테고리 이름/아이콘 상수
  - `ui/MenuCategoryRecommendationPage.tsx`: 스냅샷 읽기 + 상단 AI 추천 섹션/하단 기본 메뉴 섹션 조합
  - `ui/MenuCategoryList.tsx`, `ui/MenuCategoryItem.tsx`: 카테고리 표시
  - `ui/DefaultMenuCategoryGrid.tsx`, `ui/DefaultMenuCategoryCard.tsx`: 하단 기본 메뉴 카드 Grid 표시
- **BFF** `api/wine-pairing/menu-category/recommend/route.ts`: `POST` Route Handler

## 5. 요청 변환 규칙

`buildMenuCategoryRecommendationRequest`(순수 함수):

- 백엔드는 각 와인의 `id`/`name`/`koreanName`이 모두 공백이 아니길 요구한다.
- 앱 모델 `Wine.name`은 이미 "한글명 있으면 한글명, 없으면 원어명"으로 정규화돼 있어,
  `koreanName`에 `name`을 사용하면 한글명이 없을 때 원어명으로 대체하는 정책이 적용된다.
  (원어/한글을 분리해 보내려면 OCR 원본 필드를 별도로 보존해야 한다.)
- 필수 값이 비는 와인은 요청 전체가 거절되지 않도록 제외한다.

## 6. Query 정책

`useMenuCategoryRecommendationsQuery(request)`

- `queryKey`: `menuCategoryRecommendationQueryKeys.recommend(request.wines)` (요청 wines로 캐시 구분)
- `enabled: request.wines.length > 0`
- `staleTime: Infinity` (같은 선택에 대한 추천은 안정적이므로 재방문 시 재요청하지 않음)
- `retry: 1`

## 7. BFF Route Handler

`POST /api/wine-pairing/menu-category/recommend`

- `Content-Type: application/json`만 허용한다.
- `wines`를 검증한다: 1~100개, 각 항목의 `id`/`name`/`koreanName`은 공백이 아닌 문자열(≤200자).
- server-only `recommendMenuCategories(request)`를 `cache: "no-store"`로 호출한다.
- 응답 `menuCategories`를 `{ categories: string[] }`로 정규화해 반환한다.
- 백엔드 `400`은 `추천할 와인 정보가 올바르지 않습니다.`, 그 외/연동 실패는 `502`로 변환한다.
  백엔드 origin·에러 body는 노출하지 않는다.

## 8. 상태별 UI

`MenuCategoryRecommendationPage`(`min-h-0 flex-1 overflow-y-auto`)는 다음 두 섹션으로 구성한다.

### 상단 AI 추천 메뉴 카테고리 섹션

- 제목 문구는 `마이쏨 AI가 추천하는 메뉴 카테고리에요.`로 고정한다.
- 추천 요청 상태에 따라 아래 상태를 렌더링한다.

- **선택 없음**(`request.wines.length === 0`): `선택된 와인이 없어요.` + `/wine/list` 이동 버튼
- **로딩**: `LoadingSpinner` + `추천 메뉴를 불러오고 있어요.` (`role="status"`)
- **오류**: safe message + `다시 시도` 버튼 (`role="alert"`)
- **빈 결과**: `추천된 메뉴 카테고리가 없어요.`
- **성공**: `MenuCategoryList`로 응답 순서대로 표시
- 성공 상태의 서버 추천 메뉴 카테고리도 checkbox 기반으로 선택/해제할 수 있다.

### 하단 기본 메뉴 카테고리 섹션

- 이전 테이블 키워드 목록의 이름을 `DEFAULT_MENU_CATEGORIES` 상수로 관리한다.
- AI 추천 상태와 무관하게 동일 화면 아래쪽에 항상 노출한다.
- 서버 요청이나 BFF를 사용하지 않는다.
- 기본 메뉴 카테고리는 `designs/p2.png`의 메뉴 카드 UI처럼 3열 정사각 카드로 표시한다.
- 모든 기본 메뉴 카테고리 카드는 checkbox 기반으로 선택/해제할 수 있다.
- 각 카드는 중앙 아이콘/라벨, 흰 배경, 회색 보더, 약한 shadow를 사용하며 선택 시 보라 gradient와 체크 배지를 표시한다.
- 화면 하단에는 `designs/legacy/p3.png` 기준의 `와인 추천받기` CTA를 고정 영역으로 표시한다.
- `와인 추천받기` 클릭 시 `buildWinePairingRequest(storedRequest.wines, selectedCategories)`로
  페어링 요청을 만들어 sessionStorage에 스냅샷(`saveWinePairingRequest`)하고 `/wine/chat`으로
  이동한다. 정수 id 와인이 없거나 선택 카테고리가 없으면 버튼을 비활성화한다.
  이후 흐름은 `docs/wine-chat-pairing.md`를 참고한다.

### 선택 요약

- 서버 추천과 기본 메뉴 카테고리를 통합해 선택 개수를 계산한다.
- 선택된 카테고리가 1개 이상이면 본문 최상단에 `{count}개 선택됨` 요약을 표시한다.
- 선택 기준은 카테고리 이름 문자열이다.

상단 AI 추천 리스트는 `ul/li` semantics를 사용하고 key는 `${category}-${index}`, 긴 문자열은
`break-words`로 줄바꿈한다. 하단 기본 메뉴 Grid도 `ul/li` semantics를 유지하고 key는
정적 카테고리 `id`를 사용한다.

## 9. `shared/ui` 재사용

- `shared/ui/molecule/page-header`
- `shared/ui/atom/button`(재시도 / 선택 화면 이동)
- `shared/ui/atom/loading-spinner`(로딩/재시도)

## 10. Storybook

- `MenuCategoryItem`: `Default`, `LongName`, `Selected`
- `MenuCategoryList`: `Default`, `ManyItems`, `WithSelected`, `Interactive`, `Empty`
- `DefaultMenuCategoryCard`: `Default`, `Selected`
- `DefaultMenuCategoryGrid`: `Default`, `WithSelected`, `Interactive`, `Empty`
- `MenuCategoryRecommendationPage`: `Succeeded`, `Loading`, `EmptyResult`, `Error`, `NoSelection`

Page story는 sessionStorage 스냅샷을 seed하고 `fetch`를 스텁해 상태를 재현하며,
cleanup에서 sessionStorage와 fetch를 복원하고 Story별 QueryClient를 분리해 상태 누수를 막는다.
`Succeeded` story는 상단 AI 추천 리스트와 하단 기본 메뉴 리스트가 함께 보이는 상태를 확인한다.
