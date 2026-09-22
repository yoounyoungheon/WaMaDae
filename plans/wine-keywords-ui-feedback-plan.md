# `/wine/keywords` 추천 메뉴 UI 피드백 반영 계획

## 1. 범위와 기준

- 대상 라우트: `web/src/app/wine/keywords/page.tsx`
- 주요 구현: `web/src/app/feature/menu-category-recommendation-result/ui/MenuCategoryRecommendationPage.tsx`
- 기존 설계: `plans/wine-keywords-enhanced-design-plan.md`
- API 명세: `api/mysom-wine-pairing.md`의 `POST /v1/wine-pairings/recommend-menu`
- 피드백 원본: `temp/main-page-feedback-plan.md`의 ⑤~⑥
- 화면 기준: `designs/enhanced_design_2.png`
- 적용 가이드: `web/GUIDE.md`, `style-implementation`, `storybook-authoring`

이번 작업은 선택 상태의 가독성과 행동 안내를 개선하는 카피/스타일 변경이다. 추천 조회, 선택 상태, snapshot 저장, `/wine/chat` 이동 및 BFF/API 계약은 변경하지 않는다.

## 2. 현재 페이지 구조

```text
WineKeywordsPage [Server]
├─ PageHeader [Shared UI]
└─ MenuCategoryRecommendationPage [Client]
   ├─ IntroSection
   ├─ RecommendationResult
   │  └─ RecommendedMenuList
   │     └─ MenuNameBadge[]
   ├─ FallbackCategorySection
   └─ SubmitButton [Shared UI]
```

Client 경계와 상태 소유권은 유지한다.

- 서버 추천 결과: TanStack Query
- 현재 선택된 이름: page-local `useState`
- 이전/다음 페이지 handoff: 검증된 `sessionStorage` snapshot

이번 작업을 위해 상태나 effect를 추가하지 않는다.

## 3. 인트로 카피 수정

현재 서브카피는 추천이 생성됐다는 사실만 설명하고 선택 행동을 충분히 안내하지 않는다. 다음 두 메시지를 순서대로 제공한다.

```text
선택한 와인을 기준으로 마이쏨이 추천했어요.
원하는 메뉴를 선택해 주세요.
```

- 하나의 문단에서 자연스럽게 줄바꿈하거나, 의미가 유지되는 두 개의 block span으로 표현한다.
- 제목과의 간격, line-height, `text-ink-secondary` 계열은 유지한다.
- 화면 낭독 시 하나의 자연스러운 안내 문장으로 읽히게 한다.

## 4. 선택 개수 스타일 수정

- `N개 선택`의 `text-primary`를 `text-ink-card` 또는 동등한 검정 계열 token으로 바꾼다.
- 선택 수의 정보 중요도는 유지하기 위해 `font-bold`와 현재 크기는 유지한다.
- 0개일 때 숨기는 현재 정책도 유지한다.
- badge 선택 강조색은 이번 범위에서 변경하지 않는다. 선택된 항목과 선택 개수 사이의 색상 역할을 분리한다.

## 5. API 및 선택 계약

이번 작업은 다음 흐름을 바꾸지 않는다.

```text
WineSelectionSnapshot
-> POST /api/wine-pairings/recommend-menu
-> POST /v1/wine-pairings/recommend-menu
-> RecommendedMenu[]
-> 선택 name 저장
-> /wine/chat
```

### 별도 처리할 계약 이슈

현재 UI는 AI 추천 메뉴명뿐 아니라 fallback 카테고리 label도 `menuNames`로 저장할 수 있다. 백엔드는 최신 추천 결과에 저장된 실제 메뉴명만 pairing 입력으로 허용하므로 fallback 카테고리를 선택하면 `PAIRING_MENU_NOT_FOUND` 404가 발생할 수 있다.

- 이 문제는 카피/색상 피드백과 다른 기능 계약 이슈다.
- 이번 UI 피드백 구현에 묶어 임의로 API shape를 바꾸지 않는다.
- pairing 전에 fallback category를 실제 메뉴명으로 변환할지, 백엔드가 category 입력을 허용할지 별도 계약 결정이 필요하다.
- 계약이 해결되기 전에는 이 제약을 개발 문서와 검증 결과에 명시한다.

## 6. 파일별 구현 범위

```text
web/src/app/feature/menu-category-recommendation-result/ui/MenuCategoryRecommendationPage.tsx
web/src/app/feature/menu-category-recommendation-result/ui/MenuCategoryRecommendationPage.stories.tsx (복구 또는 신규)
docs/wine-keywords.md (구현 후 갱신)
```

아래 파일은 동작 회귀가 발견되지 않는 한 수정하지 않는다.

```text
web/src/app/entity/menu-category-recommendation/**
web/src/app/entity/wine-pairing-workflow/**
web/src/app/api/wine-pairings/recommend-menu/route.ts
```

## 7. Storybook 및 검증

페이지 story는 실제 레이아웃 폭과 session/query 의존성을 최소한으로 재현한다.

- `Default`: 추천 결과가 있고 아무 항목도 선택하지 않은 상태
- `Selected`: 1개 선택 후 검정 계열 `1개 선택` 표시
- `MultipleSelected`: 여러 항목 선택 후 숫자 갱신
- `Loading`: 추천 결과 로딩 상태에서도 인트로 카피 배치 유지
- `Error`: 오류 panel과 인트로가 겹치지 않음

필요하면 story의 `beforeEach`에서 sessionStorage snapshot과 same-origin BFF 응답만 stub하고, feature 내부 책임을 대체하는 wrapper는 만들지 않는다.

검증 명령:

```text
npx tsc --noEmit
npm run test:unit
npm run build-storybook
npm run build
```

실제 라우트에서는 추천 메뉴 선택 전/후, 360px/390px 폭, 하단 고정 버튼과 scroll 영역의 겹침을 확인한다.

## 8. 구현 순서

1. 페이지 story 또는 동등한 시각 회귀 기준을 준비한다.
2. 인트로 서브카피에 명시적인 선택 안내를 추가한다.
3. 선택 개수 색상을 ink token으로 변경한다.
4. 선택, 해제, 복수 선택 시 숫자 표시를 확인한다.
5. 기존 추천 조회와 snapshot 저장 요청이 변하지 않았는지 확인한다.
6. `docs/wine-keywords.md`에 최종 카피와 알려진 fallback 제약을 반영한다.

## 9. 완료 기준

- 인트로에서 사용자가 메뉴를 선택해야 한다는 점을 바로 이해할 수 있다.
- `N개 선택`이 보라색이 아닌 검정 계열로 표시된다.
- 선택 개수와 실제 선택 badge 수가 일치한다.
- 추천 조회, 선택/해제, 다음 화면 이동 동작에 회귀가 없다.
- 이번 변경으로 API 요청 body와 snapshot schema가 달라지지 않는다.
- fallback category 404 문제는 해결 여부와 무관하게 별도 계약 이슈로 추적된다.
