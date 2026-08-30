# `/wine/keywords` 개선 디자인 구현 계획

## 1. 범위와 기준

- 대상 라우트: `web/src/app/wine/keywords/page.tsx`
- 대상 시안: `designs/enhanced_design_2.png`
- 활성 API 명세: `api/mysom-api.md`의 `POST /v1/wine-pairing/menu-category/recommend`
- 적용 가이드: `rsc-rendering`, `rcc-rendering`, `data-flow-layering`, `css-only-state`, `style-implementation`, `storybook-authoring`
- 목적: 추천 메뉴와 전체 메뉴를 빠르게 비교·선택하고, 선택 결과로 와인 추천을 요청하는 화면을 개선한다.

## 2. 제품 결정

- 메뉴 카테고리 항목은 이번 단계에서 **이미지와 설명 없이 이름만 표시**한다.
- AI 추천 항목과 기본 카테고리는 동일한 선택 모델을 공유하지만, 정보 우선순위에 따라 서로 다른 밀도로 배치한다.
- 시안의 선택 표시는 상태 예시일 뿐이다. 서버 추천 첫 항목을 자동 선택하지 않고 사용자가 명시적으로 선택하게 한다.
- 기존 카테고리 SVG 파일은 삭제하지 않지만 이 화면에서는 렌더링하지 않는다.
- API가 반환하지 않는 카테고리 설명이나 이미지를 프론트 상수로 새로 만들지 않는다.

## 3. 화면 구조

```text
WineKeywordsPage [Server]
├─ PageHeader [Server]
│  ├─ 뒤로가기
│  └─ 가운데 제목 "추천 메뉴"
└─ MenuCategoryRecommendationPage [Client]
   ├─ IntroSection
   │  ├─ "어울리는 메뉴를 골라봤어요"
   │  └─ 선택 와인 기준 안내
   ├─ RecommendedCategorySection
   │  ├─ loading/error/empty 상태
   │  └─ MenuCategoryList
   │     └─ MenuCategoryItem[] (텍스트 + 선택 체크)
   ├─ OtherCategorySection
   │  ├─ "원하는 메뉴가 없나요?"
   │  ├─ 접기/펼치기 버튼
   │  └─ DefaultMenuCategoryGrid
   │     └─ 기존 아이콘을 사용하는 glass 카테고리 선택 항목[]
   └─ 하단 고정 "와인 추천받기" 버튼
```

## 4. 시각·상호작용 원칙

- 페이지 shell은 `/wine/list`와 동일한 `bg-canvas bg-violet-haze`를 사용한다.
- 본문/페이지 제목은 `ink-page`, 카드 제목은 `ink-card`, 강조와 밝은 CTA 라벨은 `ink-emphasis`, 설명은 `ink-secondary`, caption/placeholder는 `ink-muted`를 사용한다.
- 선택 테두리·체크·focus-visible에는 `primary`(`#6E3AF5`)를 사용한다. `ink-secondary`와 `ink-muted`에 추가 opacity를 적용해 대비를 낮추지 않는다.
- 추천 카테고리는 세로 목록으로 두고, 항목 높이·간격·테두리를 통일해 빠르게 스캔할 수 있게 한다.
- 비선택 항목은 중성 배경과 얕은 테두리, 선택 항목은 보라 테두리/옅은 강조 배경/체크 아이콘으로 구분한다.
- 이미지가 빠진 자리를 불필요한 빈 썸네일로 남기지 않는다. 항목 전체가 이름과 선택 상태에 맞춰 축소되도록 한다.
- 기본 카테고리는 기존 SVG 아이콘을 사용하는 3열 glass 카드로 구성한다. 긴 이름은 줄바꿈하고 카드 높이는 동일하게 유지한다.
- "다른 메뉴 보기"는 초기 화면 길이를 줄이는 접기/펼치기 제어로 제공한다. 페이지가 이미 Client Component이고 선택 상태와 함께 동작하므로 로컬 `useState`를 사용한다.
- 선택 개수는 CTA 문구 또는 CTA 인접 보조 정보로 표현하고, 별도의 큰 알림 카드를 추가하지 않는다.
- 하단 CTA는 safe-area를 포함해 고정하되 스크롤 콘텐츠 마지막 항목과 겹치지 않는 padding을 확보한다.

## 5. 컴포넌트 책임과 변경 대상

- `wine/keywords/page.tsx`: Server Component 유지, 가운데 정렬 `PageHeader` variant 적용.
- `MenuCategoryRecommendationPage.tsx`: 인트로, 추천/기본 섹션, 펼침 상태, CTA 배치를 조합한다.
- `MenuCategoryList.tsx`: API 응답 순서와 문자열 목록 계약을 유지한다.
- `MenuCategoryItem.tsx`: 텍스트 전용 selectable list item을 담당한다.
- `DefaultMenuCategoryGrid.tsx`: 고정 메뉴 아이콘을 포함한 3열 선택 grid를 담당한다.
- `DefaultMenuCategoryCard.tsx`: 기존 고정 메뉴 SVG 아이콘과 이름/체크 상태를 glass 카드로 렌더링한다.
- `default-menu-categories.ts`: 화면 모델을 `id`, `name` 중심으로 단순화한다. `iconPath`가 다른 소비자에게 쓰이는지 확인한 뒤 이 feature에서만 제거한다.
- 신규 공용 UI가 필요하면 `shared/ui`에 먼저 추가하고 Storybook을 작성한다. 도메인 선택 로직 자체는 feature에 둔다.
- 색상은 `/wine/list` 계획에서 등록한 `canvas`, `primary`, `ink-*`, `violet-haze` token을 재사용하고 feature 파일에 동일 hex를 반복하지 않는다.

## 6. RSC/RCC와 상태 관리

- `wine/keywords/page.tsx`는 Server Component로 유지한다.
- `MenuCategoryRecommendationPage`는 `sessionStorage`, TanStack Query, 라우팅, 다중 선택 때문에 Client Component를 유지한다.
- 추천 결과는 TanStack Query가 소유하고 `useState`나 Zustand로 복제하지 않는다.
- 선택 카테고리와 기본 메뉴 펼침 여부는 이 화면에서만 의미가 있으므로 로컬 `useState`로 관리한다.
- `selectedCount`, pairing request, CTA 활성 여부는 `request`와 `selectedCategories`에서 파생한다.
- 추천/기본 목록에서 같은 이름을 선택하면 하나의 선택값으로 취급한다. 현재 문자열 이름 계약을 유지한다.

## 7. 데이터와 API/BFF 흐름

```text
sessionStorage에서 { wineIds } 복원
-> TanStack Query
-> POST /api/wine-pairing/menu-category/recommend
-> BFF가 UUID 검증
-> POST /v1/wine-pairing/menu-category/recommend
-> { menuCategories: [{ name }] }
-> mapper/BFF가 string[]로 정규화
-> 텍스트 카테고리 목록 렌더

사용자 카테고리 선택
-> buildWinePairingRequest(wineIds, selectedCategories)
-> sessionStorage에 WinePairingRequest 저장
-> /wine/chat 이동
```

- API/BFF/entity/query key와 요청 shape는 디자인 작업에서 변경하지 않는다.
- 활성 계약은 `wineIds: UUID[]`, `menuCategories: { name: string }[]`이다.
- 추천 API가 실패해도 기본 카테고리 선택과 다음 단계 이동 가능성은 유지한다.

## 8. Storybook 및 검증

- `MenuCategoryItem`: 기본, 선택, 긴 이름, focus-visible, 비활성 콜백 상태.
- `MenuCategoryList`: 추천 1개/여러 개/빈 목록/선택 포함.
- `DefaultMenuCategoryGrid`: 접힌/펼친 상태, 선택 포함, 긴 이름, 좁은 폭.
- `MenuCategoryRecommendationPage`: loading, error, empty, no request, 성공, 다중 선택, 하단 CTA 활성.
- 이미지와 설명 없이도 선택 가능성이 명확한지 Storybook a11y 검사와 키보드 조작으로 확인한다.
- 320px 및 390px 모바일, 태블릿 폭에서 grid overflow와 CTA 겹침을 확인한다.

## 9. 완료 기준

- AI 추천은 텍스트 전용 glass 행으로, 기본 카테고리는 기존 아이콘을 포함한 glass 카드로 표시된다.
- 추천 로딩/오류/빈 상태와 기본 카테고리 선택이 서로 독립적으로 동작한다.
- 선택/해제, 중복 제거, CTA 활성화, `/wine/chat` 이동의 기존 동작이 유지된다.
- 화면 길이와 정보 밀도가 시안보다 간결해지면서도 선택 상태와 키보드 포커스가 분명하다.
