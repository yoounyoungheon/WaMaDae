# P3 맞춤 와인 추천 조건 선택 페이지 구현 계획

## 1. 기준

- 디자인: `designs/p3.png` (`379 x 717`)
- 선행 화면: `/wine/keywords`
- 후속 화면 디자인 참고: `designs/p4_1.png`, `designs/p4_2.png`
- 선택 옵션 API: `api/wine-preference-options.md`
- 추천 실행 API 문서: 없음
- 적용 가이드:
  - `data-flow-layering`
  - `rsc-rendering`
  - `rcc-rendering`
  - `css-only-state`
  - `bff-api-gateway`
  - `style-implementation`
  - `storybook-authoring`

이 문서는 P3 추천 조건 선택 페이지 한 개만 대상으로 한다.

## 2. 페이지 범위

제안 라우트:

```text
/wine/preferences
```

페이지 역할:

1. 서버에서 오늘의 기분, 도수, 페어링 음식 선택지를 조회한다.
2. 사용자의 오늘 기분을 하나 선택한다.
3. 원하는 와인 도수 범위를 하나 선택한다.
4. 함께 먹을 음식을 복수 선택한다.
5. 앞 단계에서 선택한 와인과 테이블 키워드, 현재 조건을 조합해 추천 요청을 준비한다.
6. 추천 요청 성공 후 결과 화면으로 이동한다.

`/wine/keywords`의 완료 버튼은 유효한 키워드 선택이 있을 때
`/wine/preferences`로 이동하도록 연결한다.

## 3. 디자인 분석

### 화면 구조

```text
PreferencePage
├─ Scrollable Content
│  ├─ Intro
│  │  ├─ 제목
│  │  └─ 설명
│  ├─ MoodSection
│  │  ├─ 섹션 제목
│  │  └─ 단일 선택 Chip Group
│  ├─ AlcoholSection
│  │  ├─ 섹션 제목
│  │  └─ 단일 선택 Chip Group
│  └─ FoodSection
│     ├─ 섹션 제목
│     ├─ 설명
│     └─ 카테고리별 복수 선택 Chip Group
└─ Bottom Action
   └─ 와인 추천받기 Button
```

### 시각 계층

- 별도 상단 `PageHeader` 없이 본문 제목으로 바로 시작한다.
- 전체 배경은 `background-03` 계열의 연한 회색이다.
- 본문 좌우 여백은 모바일 기준 약 `20px`, 상단 여백은 약 `28px`로 맞춘다.
- 제목은 두 줄, 굵은 `20px` 내외이며 설명은 `12~13px` 회색 텍스트다.
- 섹션 사이 간격은 약 `28~32px`, 섹션 제목과 chip group 사이는 약 `12px`다.
- chip은 내용 너비를 따르는 pill 형태이며 자동 줄바꿈된다.
- 기본 chip은 흰 배경, 회색 border, 진한 회색 텍스트다.
- 선택 chip은 보라색 배경과 흰색 텍스트를 사용한다.
- 오늘의 기분 chip은 이모지를 포함한다.
- 음식은 `육류`, `해산물`, `치즈`, `파스타` 등 카테고리 label 아래에 배치한다.
- 본문만 세로 스크롤하며 하단 CTA 영역은 흰 배경과 상단 border로 고정한다.
- CTA는 `shared/ui/atom/button`의 primary solid 스타일을 사용하고,
  sparkle 아이콘과 `와인 추천받기` 텍스트를 중앙 정렬한다.

### 디자인에 표시된 선택 상태

- 오늘의 기분: `설레는`
- 도수 추천: `낮음 (8–11%)`
- 함께 먹는 음식:
  - 육류: `소고기 스테이크`
  - 해산물: `구운 생선`

위 label에 대응하는 value는 프론트엔드에서 하드코딩하지 않고 서버 응답을 사용한다.
Storybook에서는 실제 계약과 같은 `{ label, value }` fixture로 선택 상태를 재현한다.
실제 페이지 기본값은 제품 정책이 없으므로 빈 선택으로 두고, 모든 필수 조건이
충족될 때 CTA를 활성화한다.

### 반응형 및 스크롤

- mobile-first로 `w-full`을 사용하고 chip group은 `flex flex-wrap`으로 구성한다.
- chip 폭을 고정하지 않고 텍스트 길이와 padding으로 결정한다.
- 본문은 `min-h-0 flex-1 overflow-y-auto`, CTA는 `shrink-0`으로 분리한다.
- CTA 하단 padding은 `env(safe-area-inset-bottom)`을 고려한다.
- `absolute`로 CTA를 띄우지 않고 normal flow 안에서 화면 레이아웃을 구성한다.
- 파스타 하위 항목처럼 viewport 아래로 이어지는 콘텐츠가 CTA에 가려지지 않아야 한다.

## 4. 선택 규칙과 상태

디자인을 기준으로 한 1차 규칙:

| 항목 | 선택 방식 | 필수 여부 | 상태 값 |
| --- | --- | --- | --- |
| 오늘의 기분 | 단일 선택 | 필수 | `string \| null` |
| 도수 추천 | 단일 선택 | 필수 | `string \| null` |
| 함께 먹는 음식 | 복수 선택 | 1개 이상 | `string[]` |

CTA 활성 조건:

```text
moodValue !== null
&& alcoholValue !== null
&& selectedPairingFoodValues.length > 0
&& 추천 mutation이 실행 중이 아님
```

추천 조건은 여러 섹션과 CTA가 공유하고 다음 추천 요청에도 필요하므로
`useState`가 아니라 feature 범위 Zustand store로 관리한다. 서버 데이터는 store에
저장하지 않는다.

```ts
type WinePreferenceSelectionState = {
  moodValue: string | null;
  alcoholValue: string | null;
  selectedPairingFoodValues: string[];
  selectMood: (value: string) => void;
  selectAlcohol: (value: string) => void;
  togglePairingFood: (value: string) => void;
  reset: () => void;
};
```

- Zustand에는 서버 옵션 객체나 label을 복제하지 않고 선택된 `value`만 저장한다.
- 렌더링에 필요한 label/value 옵션은 Server Component가 전달한 props를 사용한다.
- CTA 활성 여부와 선택 개수는 저장하지 않고 controller에서 계산한다.
- store는 필요한 값과 action만 selector로 구독한다.
- `/wine/*` 단계 이동 중 draft를 유지하기 위해 provider를
  `web/src/app/wine/layout.tsx`에 추가한다.
- 플로우를 벗어나 layout이 unmount되면 draft도 초기화한다.

## 5. RSC/RCC 경계

```text
wine/preferences/page.tsx          [Server Component]
└─ WinePreferenceSelectPage        [Server Component, options props]
   ├─ Intro                        [Server Component]
   ├─ WinePreferenceForm           [Client Component]
   │  ├─ PreferenceSection         [표현 전용]
   │  │  └─ ChoiceChip             [shared/ui atom]
   │  └─ FoodPreferenceGroup       [표현 전용]
   └─ WinePreferenceBottomAction   [Client Component]
```

### Server Component

`web/src/app/wine/preferences/page.tsx`

- `page.tsx`는 Server Component로 유지한다.
- metadata와 feature page 조합을 담당한다.
- server-only 조회 함수로 선택 옵션을 한 번 조회하고 DTO를 앱 모델로 변환한다.
- 변환된 `WinePreferenceOptions`를 `WinePreferenceSelectPage`의 직렬화 가능한 props로
  직접 전달한다.
- 화면 안에서 옵션을 재조회하거나 갱신할 요구가 없으므로 TanStack Query,
  `HydrationBoundary`, 클라이언트 조회 API를 사용하지 않는다.

### Client Component

상호작용이 필요한 `WinePreferenceForm`과 `WinePreferenceBottomAction`만 Client
Boundary로 둔다. `WinePreferenceSelectPage`는 정적 intro, scroll/CTA 레이아웃,
서버 props 전달만 담당하므로 Server Component로 유지한다.

- Zustand 선택 draft 구독
- props로 전달받은 선택 옵션 렌더링
- radio/checkbox change 처리
- CTA 활성 조건 계산
- 추천 mutation 실행 및 오류 표시

하위 표현 컴포넌트에는 불필요한 `"use client"`를 추가하지 않는다.

## 6. 서버 응답 계약과 도메인 모델

### 서버 응답 DTO

API 필드명은 올바른 영문 표기로 통일한다.

```ts
type PreferenceOptionDto = {
  label: string;
  value: string;
  iconPath?: string;
};

type PairingFoodCategoryDto = {
  label: string;
  value: string;
  options: PreferenceOptionDto[];
};

type GetWinePreferenceOptionsResponseDto = {
  data: {
    mood: PreferenceOptionDto[];
    alcohol: PreferenceOptionDto[];
    pairingFood: PairingFoodCategoryDto[];
  };
};
```

최상위 필드명은 `mood`, `alcohol`, `pairingFood`를 사용한다. `pairingFood`의 각
카테고리는 표시용 `label`, 식별용 `value`, 하위 선택지 `options`를 가진다.

API 응답 예시:

```json
{
  "data": {
    "mood": [
      {
        "label": "설레는",
        "value": "excited",
        "iconPath": "/images/wine-preferences/excited.svg"
      },
      { "label": "편안한", "value": "relaxed" }
    ],
    "alcohol": [
      { "label": "낮음 (8–11%)", "value": "low" },
      { "label": "중간 (12–13%)", "value": "medium" }
    ],
    "pairingFood": [
      {
        "label": "육류",
        "value": "meat",
        "options": [
          { "label": "소고기 스테이크", "value": "beefSteak" },
          { "label": "돼지갈비", "value": "porkRibs" }
        ]
      },
      {
        "label": "해산물",
        "value": "seafood",
        "options": [
          { "label": "생선회", "value": "sashimi" },
          { "label": "구운 생선", "value": "grilledFish" }
        ]
      }
    ]
  }
}
```

신규 경로:

```text
web/src/app/entity/wine-preference/
├─ model/
│  └─ wine-preference.type.ts
└─ api/
   ├─ wine-preference.mapper.ts
   └─ wine-preference.server.ts
```

앱 모델:

```ts
type WinePreferenceOption = {
  label: string;
  value: string;
  iconPath?: string;
};

type PairingFoodGroup = {
  label: string;
  value: string;
  options: WinePreferenceOption[];
};

type WinePreferenceOptions = {
  mood: WinePreferenceOption[];
  alcohol: WinePreferenceOption[];
  pairingFood: PairingFoodGroup[];
};
```

규칙:

- chip의 표시 문자열은 `label`, 선택 및 추천 요청 값은 `value`를 사용한다.
- 프론트엔드에서 mood, alcohol, food option의 label/value 목록을 하드코딩하지 않는다.
- `iconPath`가 있으면 chip의 label 앞에 장식 아이콘을 렌더링한다.
- `iconPath`가 없으면 아이콘 영역과 간격을 만들지 않는다.
- 음식 카테고리 제목은 `pairingFood[].label`, 카테고리 식별자는
  `pairingFood[].value`를 사용한다.
- 프론트엔드는 `meat → 육류` 같은 카테고리 label mapping을 보유하지 않는다.
- 서버가 새 카테고리를 추가하면 프론트엔드 코드 변경 없이 응답 순서대로 렌더링한다.
- `value`는 각 선택 그룹 안에서 고유해야 한다. 음식 category 간 value 중복 가능성이
  있다면 store와 제출 값은 `category:value` 합성값이 아니라 서버가 제공하는 전역
  고유 value를 사용하도록 계약을 보완한다.

## 7. 공통 UI 재사용 및 추가

### 기존 공통 UI

- CTA: `shared/ui/atom/button`
  - `variant="solid"`
  - `type="primary"`
  - `radius="lg"`
  - `h-12 w-full`
- 아이콘: `lucide-react`의 sparkle 계열 아이콘을 사용한다.

### 신규 공통 UI

`shared/ui`에 chip 역할의 공통 컴포넌트가 없으므로 feature 내부에 중복 구현하지 않고
다음 atom을 먼저 추가한다.

```text
web/src/app/shared/ui/atom/choice-chip.tsx
web/src/app/shared/ui/atom/choice-chip.stories.tsx
```

공개 API 초안:

```ts
type ChoiceChipProps = {
  inputType: "radio" | "checkbox";
  name?: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  iconPath?: string;
  selectedTone?: "purple" | "blue";
  disabled?: boolean;
  className?: string;
};
```

구현 원칙:

- root는 `label`, 내부 입력은 `sr-only` native `radio` 또는 `checkbox`다.
- `iconPath`가 있으면 `14 x 14` 장식 이미지를 label 앞에 표시한다.
- 아이콘은 `alt=""`, `aria-hidden`으로 처리하며 접근 가능한 이름은 label이 제공한다.
- 선택 스타일은 `has-[:checked]`, 포커스는 `has-[:focus-visible]`로 표현한다.
- `radio` 그룹은 같은 `name`을 사용한다.
- 색상만으로 상태를 전달하지 않도록 native checked semantics를 유지한다.
- `aria-pressed`를 button에 중복 적용하지 않는다.
- 모든 선택 chip은 동일한 보라색 tone을 사용한다.

순수 CSS-only 상태로 끝내지는 않는다. 선택값이 CTA 검증, 다단계 draft, 추천 요청
payload에 사용되므로 native input의 상태 표현은 CSS selector로 처리하되 실제 값은
Zustand의 controlled state와 연결한다.

## 8. Feature 구조

```text
web/src/app/feature/wine-preference-select/
├─ api/
│  └─ use-request-wine-recommendation-mutation.ts  # 추천 API 확정 후
├─ model/
│  ├─ wine-preference-selection.store.ts
│  ├─ wine-preference-selection-provider.tsx
│  └─ use-wine-preference-select-controller.ts
└─ ui/
   ├─ WinePreferenceSelectPage.tsx
   ├─ WinePreferenceForm.tsx
   ├─ WinePreferenceBottomAction.tsx
   ├─ WinePreferenceSelectPage.stories.tsx
   ├─ PreferenceSection.tsx
   ├─ PreferenceSection.stories.tsx
   ├─ FoodPreferenceGroup.tsx
   └─ wine-preference-select.props.ts
```

책임:

- store/provider: 추천 조건 draft와 선택 action
- controller: props 옵션과 선택 draft 조합, validation 파생 값, mutation 연결
- page: 서버 wrapper, 정적 intro, scroll/CTA 레이아웃, 서버 옵션 props 전달
- form: 선택 chip 렌더링과 radio/checkbox change 처리
- bottom action: CTA 활성 조건 구독과 추천 실행 연결
- section/group: label, 설명, chip 배치만 담당
- 옵션 데이터: Server Component가 Entity server 함수와 mapper로 조회한 결과를 props로 사용

### 선택 옵션 조회 흐름

```text
wine/preferences/page.tsx
→ wine-preference.server.ts의 server-only 조회 함수 호출
→ DTO mapper
→ WinePreferenceOptions 앱 모델 생성
→ <WinePreferenceSelectPage options={options} />
→ Server Component가 정적 구조 렌더링
→ Client Component가 props의 label/value로 선택 영역과 CTA 렌더링
```

- 서버 옵션을 Zustand나 `useState`에 복제하지 않는다.
- Client Component는 전달받은 props를 읽기 전용 원본으로 사용한다.
- 화면 내 재조회 요구가 없으므로 Query key/hook과 선택 옵션용 BFF Route Handler를
  만들지 않는다.
- 옵션 변경은 페이지 재진입 또는 새로고침 시 서버 조회 결과에 반영된다.
- 서버 조회 실패는 App Router의 `error.tsx` 경계에서 처리한다.
- 서버가 빈 옵션을 반환하면 Server Component 또는 feature page가 안전한 empty UI를
  렌더링하고 CTA를 비활성화한다.

## 9. 추천 API와 BFF 계획

선택 옵션은 다음 계약을 사용한다.

```http
GET /api/wine-preference-options
```

Server Component는 server-only API adapter를 통해 위 계약의 응답을 조회한다.
`wine-preference.server.ts`는 `/wine-preference-options` 도메인 경로만 알고,
`/api` prefix와 `http://localhost:8080` base URL 조합은 `utils/http/server-api.ts`에서 담당한다.
실제 backend path는 `WINE_PREFERENCE_OPTIONS_PATH`로 교체할 수 있지만, 이 값도
HTTP 계층 prefix가 없는 도메인 경로로 관리한다.

선택 옵션 요청의 최종 URL은 `http://localhost:8080/api/wine-preference-options`이다.

추천 실행 API는 아직 명세가 없다. 따라서 다음 항목은 구현 전에 백엔드 계약이
필요하다.

- HTTP method와 backend endpoint
- 선택한 와인 ID와 테이블 키워드 ID 포함 여부
- mood/alcohol/food option의 `value` 규칙과 고유성
- 응답 DTO와 추천 결과 ID
- 오류 응답
- 인증 방식
- 일반 JSON 응답인지 streaming 응답인지
- 성공 후 이동할 정확한 라우트

필요한 프론트엔드 요청 형태:

```ts
type RequestWineRecommendationInput = {
  selectedWineIds: string[];
  selectedTableKeywordIds: string[];
  moodValue: string;
  alcoholValue: string;
  pairingFoodValues: string[];
};
```

이는 프론트엔드 필요 계약의 초안이며 실제 API 필드명으로 확정하지 않는다.

API 확정 후 데이터 흐름:

```text
CTA click
→ controller에서 wine/table-keyword/preference draft 조합
→ TanStack Query mutation
→ POST /api/wine-recommendations
→ Route Handler에서 zod 입력 검증 및 인증
→ server-only backend 요청
→ 안전한 응답 DTO 반환
→ 성공 시 추천 결과 route 이동
```

- 브라우저는 same-origin `/api/wine-recommendations`만 호출한다.
- backend origin과 token은 server-only 계층에 둔다.
- mutation 입력은 클라이언트와 Route Handler 양쪽에서 검증한다.
- API가 확정되기 전에는 가짜 성공 mutation이나 임의 Route Handler를 만들지 않는다.
- API 미확정 상태에서 UI를 먼저 구현한다면 CTA는 선택 validation까지만 구현하고,
  실제 요청 연결이 안 된 상태임을 코드와 Storybook에서 명확히 분리한다.

## 10. 사용자 인터랙션과 접근성

- 기분/도수 섹션은 `fieldset`과 `legend`, native radio로 구성한다.
- 음식 섹션은 카테고리별 label과 native checkbox 목록으로 구성한다.
- chip 전체 영역을 클릭/탭할 수 있게 `label` root를 사용한다.
- 키보드 `Tab`, `Space`, radio arrow-key 기본 동작을 보존한다.
- focus-visible outline을 명확히 표시한다.
- mutation 중에는 CTA를 disabled 처리하고 중복 요청을 막는다.
- mutation 오류는 CTA 위에 `role="alert"`로 안전한 메시지를 표시한다.
- 오류가 발생해도 사용자가 선택한 draft는 유지한다.

## 11. Storybook 범위

### `ChoiceChip`

- `Default`
- `SelectedPurple`
- `SelectedBlue`
- `Radio`
- `Checkbox`
- `WithEmoji`
- `Disabled`
- `FocusVisible`
- `LongLabel`

### `PreferenceSection`

- `MoodOptions`
- `AlcoholOptions`
- `WrappedOptions`

### `WinePreferenceSelectPage`

- `Default`
- `EmptyOptions`
- `PartiallySelected`
- `ReadyToSubmit`
- `LongFoodOptions`

규칙:

- title은 `Components/ChoiceChip`,
  `Feature/wine-preference-select/<ComponentName>` 형식을 사용한다.
- `Default`를 반드시 포함한다.
- page story는 `w-[350px] h-[717px]`의 최소 wrapper로 실제 모바일 viewport와
  스크롤/고정 CTA를 재현한다.
- story마다 독립 Zustand store 인스턴스를 제공해 선택 상태가 누수되지 않게 한다.
- Storybook fixture도 서버 계약과 동일한 `{ label, value }` 데이터로 작성한다.

## 12. 구현 순서

1. 선택 옵션 API 계약과 추천 API/후속 라우트의 미정 항목 확인
2. `ChoiceChip` atom과 Storybook 작성
3. DTO, 앱 모델, mapper 작성
4. 선택 옵션 server-only 조회 함수 작성
5. Zustand store/provider 작성 후 `wine/layout.tsx`에 provider 추가
6. 표현 컴포넌트와 page props 작성
7. controller와 CTA validation 구현
8. `/wine/preferences/page.tsx`에서 옵션 조회 후 Server Component feature page에 props 전달
9. `/wine/keywords` 완료 버튼을 새 라우트에 연결
10. feature/page Storybook 상태 작성
11. 추천 API 확정 시 mutation, BFF Route Handler, 성공 이동 연결
12. 디자인과 350px 모바일 viewport 시각 비교
13. 구현 완료 후 `docs/`에 페이지 개발 문서 작성

## 13. 검증

```bash
cd web
npx tsc --noEmit
npm run build
npm run build-storybook
```

추가 확인:

- 350px 폭에서 chip 줄바꿈과 CTA 겹침 없음
- 본문 마지막 옵션까지 스크롤 가능
- 기분과 도수는 각각 하나만 선택됨
- 음식은 복수 선택/해제 가능
- 키보드만으로 전체 입력과 CTA 접근 가능
- 필수 조건 전 CTA 비활성
- 옵션 API 응답의 label/value가 그대로 렌더링과 제출에 사용됨
- 선택 옵션 조회가 Server Component에서 한 번만 수행됨
- Client Component에서 선택 옵션 API를 재호출하지 않음
- 빈 옵션에서는 empty UI가 표시되고 CTA가 비활성화됨
- mutation 중 중복 제출 방지
- 뒤로 이동 후 이전 단계 draft 유지
- 추천 API 미확정 필드를 임의 구현하지 않음

## 14. 구현 전 확정이 필요한 항목

1. 음식 선택이 실제로 필수인지 여부와 최대 선택 개수
2. 추천 요청 API 명세
3. 추천 결과 화면 route
4. P3에서 뒤로가기 UI가 의도적으로 없는지 여부
