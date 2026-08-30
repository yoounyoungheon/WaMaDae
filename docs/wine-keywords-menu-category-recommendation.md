# `/wine/keywords` 메뉴 카테고리 추천 화면

`/wine/keywords`는 `/wine/list`에서 선택한 wine snapshot UUID로 메뉴 카테고리를 추천받고, 실제 페어링에 사용할 메뉴를 고르는 화면이다. 활성 API 계약은 `api/mysom-api.md`를 기준으로 한다.

## 1. 화면 구조

```text
WineKeywordsPage                         [Server]
├─ PageHeader                            [Server]
└─ MenuCategoryRecommendationPage        [Client]
   ├─ intro
   ├─ AI 추천 메뉴 카테고리
   │  ├─ loading/error/empty 상태
   │  └─ MenuCategoryList
   │     └─ MenuCategoryItem[]
   ├─ 다른 메뉴 보기
   │  └─ DefaultMenuCategoryGrid
   │     └─ DefaultMenuCategoryCard[]
   └─ 하단 "와인 추천받기" CTA
```

- 페이지 shell은 `bg-canvas bg-violet-haze`, 텍스트는 `ink-*`, 선택/focus는 `primary` token을 사용한다.
- 추천 항목은 이미지와 설명 없이 이름과 선택 상태만 표시한다.
- 추천 목록은 세로 glass 행이며, 기본 메뉴는 기존 SVG 아이콘을 사용하는 접기/펼치기형 3열 glass grid다.
- 서버 추천 첫 항목을 자동 선택하지 않는다. 추천/기본 메뉴는 같은 다중 선택 배열을 공유한다.
- CTA는 wine UUID와 카테고리가 각각 1개 이상일 때만 활성화된다.

## 2. RSC/RCC와 상태

| 상태 | 소유자 | 방식 |
| --- | --- | --- |
| 추천 요청 `{ wineIds }` | 이전 단계 snapshot | `sessionStorage` |
| 추천 카테고리 | 서버 | TanStack Query |
| 기본 카테고리 | 프론트엔드 | module constant |
| 선택 카테고리 | 현재 화면 | `useState<string[]>` |
| 다른 메뉴 펼침 | 현재 화면 | `useState<boolean>` |
| 페어링 요청 | 다음 화면 snapshot | `sessionStorage` |

- `wine/keywords/page.tsx`는 Server Component다.
- `MenuCategoryRecommendationPage`만 storage hydration, Query, 다중 선택, router 이벤트 때문에 Client Component다.
- Query 결과를 Zustand나 `useState`에 복제하지 않는다.
- `selectedCount`, pairing request, CTA 활성 상태는 현재 request와 선택 배열에서 파생한다.

## 3. 데이터 흐름

```text
/wine/list
-> saveMenuCategoryRecommendationRequest({ wineIds })
-> /wine/keywords
-> hydration 후 sessionStorage snapshot 검증
-> POST /api/wine-pairing/menu-category/recommend
-> BFF UUID 검증
-> POST /v1/wine-pairing/menu-category/recommend
-> { menuCategories: [{ name }] }
-> mapper가 string[]로 변환
-> MenuCategoryList 렌더

카테고리 선택
-> buildWinePairingRequest(wineIds, selectedCategories)
-> { wineIds, menuCategories: [{ name }] }
-> saveWinePairingRequest(...)
-> /wine/chat
```

## 4. 계층별 책임

- `entity/menu-category-recommendation/model`: `{ wineIds: UUID[] }` 요청과 응답 DTO 타입.
- `entity/menu-category-recommendation/lib`: 선택 와인 변환과 sessionStorage 검증.
- `entity/menu-category-recommendation/api`: 브라우저 BFF 호출, 서버 전용 백엔드 호출, DTO mapper.
- `feature/.../api`: Query key factory와 TanStack Query 정책.
- `feature/.../ui`: 비동기 상태, 카테고리 선택, CTA 조합.
- `api/wine-pairing/menu-category/recommend/route.ts`: JSON/UUID 검증, safe error 변환.

## 5. 오류와 빈 상태

- snapshot이 없거나 invalid이면 API를 호출하지 않고 `/wine/list` 복귀 액션을 표시한다.
- 추천 API가 실패하거나 빈 배열을 반환해도 "다른 메뉴 보기"에서 기본 카테고리를 선택할 수 있다.
- retry 중에는 retry 버튼을 잠그고 로딩 상태를 표시한다.
- 기본 카테고리 이름이 추천 결과와 같으면 하나의 선택값으로 취급한다.

## 6. Storybook과 검증

- Item/List/Grid: 기본, 선택, 긴 이름, 빈 목록, interactive 상태.
- Page: 성공, loading, empty, error, snapshot 없음.
- `npm run build`, `npm run build-storybook`으로 타입과 번들 생성을 확인한다.
- Playwright에서 320px/390px viewport의 수평 overflow, grid 폭, 하단 CTA 겹침을 확인한다.
