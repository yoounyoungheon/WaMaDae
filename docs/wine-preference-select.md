# 맞춤 와인 추천 조건 선택 페이지 구조 및 데이터 흐름

`/wine/preferences` 화면의 UI, 상태 관리, 서버 데이터 조회 흐름을 정리한다.
기준 구현은 `feature/wine-preference-select/ui/WinePreferenceSelectPage.tsx`이며,
API 계약은 `api/wine-preference-options.md`, 설계 배경은 `plans/P3_PLAN.md`를
참고한다.

## 1. 페이지 구조

```text
wine/preferences/page.tsx             [Server Component]
└─ WinePreferenceSelectPage           [Server Component]
   ├─ Intro                           정적 제목/설명
   ├─ WinePreferenceForm              [Client Component]
   │  ├─ PreferenceSection            오늘의 기분
   │  │  └─ ChoiceChip                native radio
   │  ├─ PreferenceSection            도수 추천
   │  │  └─ ChoiceChip                native radio
   │  └─ FoodPreferenceGroup[]        음식 카테고리
   │     └─ ChoiceChip                native checkbox
   └─ WinePreferenceBottomAction      [Client Component]
      └─ 와인 추천받기 Button
```

- `page.tsx`는 Server Component로 유지한다.
- 선택 옵션은 서버에서 한 번 조회한 뒤 `WinePreferenceSelectPage`에 전달하고, 이
  서버 컴포넌트가 필요한 하위 Client Component에 직렬화 가능한 props로 넘긴다.
- `WinePreferenceSelectPage`도 Server Component로 유지하고, 사용자 선택과 CTA 활성
  상태가 필요한 `WinePreferenceForm`, `WinePreferenceBottomAction`만 Client
  Component로 둔다.

## 2. 서버 데이터

선택 옵션 계약:

```http
GET /api/wine-preference-options
```

응답 앱 모델:

```ts
type WinePreferenceOptions = {
  mood: WinePreferenceOption[];
  alcohol: WinePreferenceOption[];
  pairingFood: {
    label: string;
    value: string;
    options: WinePreferenceOption[];
  }[];
};
```

데이터 흐름:

```text
wine/preferences/page.tsx
→ getWinePreferenceOptions()
→ requestServerApi()
→ 응답 DTO zod 검증
→ mapWinePreferenceOptionsDto()
→ WinePreferenceSelectPage options props
→ WinePreferenceForm / WinePreferenceBottomAction options props
```

- 브라우저에서 선택 옵션 API를 다시 호출하지 않는다.
- 서버 응답 데이터는 Zustand나 `useState`에 복제하지 않는다.
- `label`은 화면 표시, `value`는 선택 식별과 추천 요청 입력에 사용한다.
- 선택 옵션의 `iconPath`가 있으면 label 앞에 장식 아이콘을 표시한다.
- wine preference entity API 모듈은 `/wine-preference-options` 도메인 경로만 알고,
  mock/real API prefix 결정은 `utils/http/server-api.ts`가 담당한다.
- 서버 경로는 `WINE_PREFERENCE_OPTIONS_PATH`로 교체할 수 있지만, 이 값도 `/api` prefix
  없는 도메인 경로로 관리한다.
- 개발 환경에서 `useMockApi=true`이면 `server-api.ts`가 최종 요청 URL을
  `http://localhost:3030/api/mock/`으로 변환한다.
- 개발 환경에서 `useMockApi`가 `true`가 아니면 최종 요청 URL은
  `http://localhost:8080/api/wine-preference-options`이다.

## 3. 선택 상태

`WinePreferenceSelectionProvider`는 `/wine/*` 세그먼트 layout에 배치한다.

```ts
type WinePreferenceSelectionState = {
  moodValue: string | null;
  alcoholValue: string | null;
  selectedPairingFoodValues: string[];
};
```

- 기분과 도수는 native radio 기반 단일 선택이다.
- 음식은 native checkbox 기반 복수 선택이다.
- Zustand에는 서버 option 객체가 아니라 선택된 `value`만 저장한다.
- store의 각 값과 action은 selector로 개별 구독한다.
- 같은 `/wine/*` flow 안에서 이동하면 선택 draft가 유지된다.

CTA 활성 조건:

```text
서버 mood options에 현재 moodValue가 존재
&& 서버 alcohol options에 현재 alcoholValue가 존재
&& 서버 pairingFood options에 선택된 value가 하나 이상 존재
```

추천 실행 API가 아직 정의되지 않아 CTA는 현재 유효성 및 활성 상태까지만 구현한다.

## 4. 공통 UI와 접근성

`shared/ui/atom/choice-chip.tsx`를 기분, 도수, 음식 선택에 공통으로 사용한다.

- root는 클릭 영역을 제공하는 `label`이다.
- 내부에 `sr-only` native radio 또는 checkbox를 둔다.
- 선택 스타일은 `has-[:checked]`로 표현한다.
- 키보드 포커스는 `has-[:focus-visible]` outline으로 표시한다.
- `iconPath`가 있는 경우에만 `14 x 14` 아이콘과 간격을 렌더링한다.
- 아이콘은 `alt=""`, `aria-hidden`으로 처리해 label과 접근 가능한 이름이 중복되지
  않게 한다.
- 기분, 도수, 음식 모두 동일한 보라색 선택 tone을 사용한다.
- 색상 표현과 함께 native checked semantics를 유지한다.

하단 CTA는 `shared/ui/atom/button`을 재사용한다. 본문은
`min-h-0 flex-1 overflow-y-auto`, CTA 영역은 `shrink-0`으로 구성해 absolute
position 없이 화면 아래에 유지한다.

## 5. 이전 단계 연결

`/wine/keywords`의 완료 버튼은 테이블 키워드가 하나 이상 선택됐을 때
`/wine/preferences`로 이동한다. 선택값은 `app/wine/layout.tsx`의 각 feature provider가
유지한다.

## 6. Storybook

- `Components/ChoiceChip`
  - 기본, 선택 tone, 인터랙션, disabled, focus-visible, 긴 label
- `Feature/wine-preference-select/PreferenceSection`
  - 기분, 도수, empty, interactive
- `Feature/wine-preference-select/WinePreferenceSelectPage`
  - 기본, 부분 선택, 제출 가능, empty, 긴 음식 옵션

페이지 story는 `350 x 717` wrapper로 모바일 스크롤과 하단 CTA 문맥을 재현하며,
story마다 독립된 Zustand store를 제공한다.
