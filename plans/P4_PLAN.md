# P4 맞춤 와인 추천 결과 페이지 구현 계획

## 1. 기준

- 디자인: `designs/p4_1.png`, `designs/p4_2.png`
- 선행 화면: `/wine/preferences`
- 추천 결과 Mock API: `GET /api/mock/wine-recommendations`
- 추천 결과 실제 API 문서: 없음
- 채팅 전송 API 문서: 없음
- 적용 가이드:
  - `data-flow-layering`
  - `rsc-rendering`
  - `rcc-rendering`
  - `bff-api-gateway`
  - `style-implementation`
  - `storybook-authoring`

이 문서는 P4 추천 결과 페이지와 해당 화면의 후속 질문 채팅 UI만 대상으로 한다.

## 2. 페이지 범위

제안 라우트:

```text
/wine/recommendations
```

페이지 역할:

1. 서버에서 추천 받은 와인 3개와 추가 질문 4개를 조회한다.
2. 추천 와인 3개를 캐러셀로 보여준다.
3. 네 개의 추가 질문을 렌더링한다.
4. 추가 질문을 클릭하면 채팅 Dialog를 열고 해당 질문을 입력창에 자동 입력한다.
5. Floating 채팅 아이콘을 클릭하면 입력값 없이 채팅 Dialog만 연다.
6. 채팅 Dialog에서 메시지를 입력하고 전송할 수 있다.
7. 현재 전송 콜백은 `console.log(message)`로만 처리하고, 추후 API 연동이 가능하게 구조를 열어둔다.

## 3. 디자인 분석

### P4_1 화면 구조

```text
RecommendationResultPage
├─ PageHeader
│  ├─ Back Button
│  └─ Title
├─ Recommendation Carousel
│  ├─ Wine Card
│  │  ├─ Rank Badge
│  │  ├─ Rating Badge
│  │  ├─ Korean Wine Name
│  │  ├─ Description
│  │  ├─ Area
│  │  └─ Price
│  ├─ Previous / Next Controls
│  └─ Indicator
├─ Follow-up Question Section
│  ├─ Section Title
│  └─ Question Grid
├─ Floating Chat Button
```

### P4_2 화면 구조

```text
RecommendationResultPage
└─ Chat Dialog
   ├─ Dialog Header
   │  ├─ Title
   │  └─ Close Button
   ├─ Greeting Message
   ├─ Selected Question Bubble
   ├─ Sample Answer Bubble
   └─ Input Area
      ├─ Text Input
      └─ Send Button
```

### 시각 계층

- 전체 화면은 모바일 기준 `390 x 715` 내외를 기준으로 구현한다.
- 상단은 공통 `PageHeader` 기본 레이아웃을 사용해 `/wine/ai` 페이지와 헤더 높이와 위치를 맞춘다.
- 제목은 `20px` 내외의 굵은 텍스트다.
- 추천 와인 카드는 rounded image card이며 이미지 위에 어두운 gradient overlay를 둔다.
- 카드 좌상단에는 파란색 `1순위` badge, 우상단에는 별점 badge를 둔다.
- 와인명과 설명은 이미지 하단 좌측에 배치하고, 가격은 우하단에 파란색으로 강조한다.
- 캐러셀 이전/다음 버튼은 카드 좌우 중간에 겹쳐서 표시한다.
- indicator는 현재 index만 파란색 pill, 나머지는 회색 dot으로 표시한다.
- 추가 질문 섹션은 sparkle 아이콘과 제목을 row로 배치한다.
- 질문은 2열 grid로 배치하고, 각 카드는 연한 파란 border와 흰 배경을 사용한다.
- 질문 카드 좌상단에는 작은 파란 채팅 아이콘 badge가 겹쳐 보인다.
- floating 채팅 버튼은 우하단에 고정하며, Dialog open 상태에서도 X로 변하지 않는다.
- Dialog 내부 header의 close X는 별도 닫기 버튼으로 유지한다.
- 하단 네비게이션은 P4 화면에서 렌더링하지 않는다.

### 반응형 및 레이아웃

- mobile-first로 구현한다.
- page root는 `min-h-dvh flex flex-col` 구조를 기본으로 한다.
- 본문은 하단 내비게이션과 floating button을 가리지 않도록 충분한 bottom padding을 둔다.
- 카드와 Dialog는 `w-full max-w-*` 조합을 사용해 모바일 overflow를 방지한다.
- Dialog는 Radix Dialog를 사용하되 디자인처럼 우하단 floating card에 가깝게 위치를 커스텀한다.
- Dialog overlay는 필요하지만, 디자인상 배경을 과하게 어둡게 만들지 않는다.

## 4. API 계약과 데이터 모델

### Mock API

```http
GET /api/mock/wine-recommendations
```

현재 mock 서버 기준 전체 URL:

```text
http://localhost:3030/api/mock/wine-recommendations
```

### 응답 DTO

와인 API 계약은 다음 필드를 사용한다.

```ts
type RecommendedWineDto = {
  id: number;
  koreanName: string;
  englishName: string;
  price: string;
  description: string;
  area: string;
  rating: number;
  rank: number;
};

type FollowUpQuestionDto = {
  id: number;
  label: string;
};

type GetWineRecommendationsResponseDto = {
  data: {
    wines: RecommendedWineDto[];
    followUpQuestions: FollowUpQuestionDto[];
    chat: {
      greetingMessage: string;
      sampleAnswer: string;
    };
  };
};
```

### 앱 모델

초기에는 DTO와 거의 동일하게 사용하되, UI 전용 필드는 서버 계약에 추가하지 않는다.

```ts
type RecommendedWine = {
  id: number;
  koreanName: string;
  englishName: string;
  price: string;
  description: string;
  area: string;
  rating: number;
  rank: number;
};

type FollowUpQuestion = {
  id: number;
  label: string;
};

type WineRecommendationResult = {
  wines: RecommendedWine[];
  followUpQuestions: FollowUpQuestion[];
  chat: {
    greetingMessage: string;
    sampleAnswer: string;
  };
};
```

### 이미지 처리

현재 와인 API 계약에는 이미지 필드가 없다. 따라서 P4 1차 구현에서는 다음 중 하나를 선택해야 한다.

1. 디자인 재현을 위해 임시 local placeholder 이미지를 카드 배경으로 사용한다.
2. 이미지 없는 상태를 감안한 gradient/card UI로 구현한다.
3. 백엔드 계약에 `imageUrl` 또는 `imagePath` 추가를 요청한다.

추천은 1번이다. 단, placeholder 이미지는 앱 모델에 섞지 않고 UI 컴포넌트 내부 fallback으로만 둔다.

## 5. RSC/RCC 경계

```text
wine/recommendations/page.tsx              [Server Component]
└─ WineRecommendationResultPage            [Server Component]
   ├─ ResultHeader                         [Server Component]
   └─ WineRecommendationResultClient       [Client Component]
      ├─ WineRecommendationCarousel        [Client Component]
      ├─ FollowUpQuestionSection           [Client Component]
      ├─ FloatingChatButton                [Client Component]
      └─ WineRecommendationChatDialog      [Client Component]
```

### Server Component

`web/src/app/wine/recommendations/page.tsx`

- `page.tsx`는 Server Component로 유지한다.
- 추천 결과 API를 서버에서 한 번 조회한다.
- DTO를 zod로 검증하고 앱 모델로 변환한다.
- 변환된 `WineRecommendationResult`를 `WineRecommendationResultPage`에 props로 전달한다.
- Client Component에서 추천 결과를 다시 조회하지 않는다.

### Client Component

`WineRecommendationResultClient`만 Client Boundary로 둔다.

- 캐러셀 현재 index 관리
- 이전/다음 버튼 처리
- 추가 질문 클릭 처리
- 채팅 Dialog open/close 관리
- 채팅 input value 관리
- 전송 버튼 submit 처리

P4 상태는 화면 내부 상호작용에만 필요하므로 Zustand를 사용하지 않는다.

## 6. 상태와 이벤트

### 상태

```ts
type RecommendationClientState = {
  currentWineIndex: number;
  isChatOpen: boolean;
  chatInputValue: string;
};
```

### 이벤트 흐름

질문 클릭:

```text
question card click
→ chatInputValue = question.label
→ isChatOpen = true
```

채팅 아이콘 클릭:

```text
floating chat button click
→ isChatOpen = true
→ 기존 input 값은 유지하거나 비움
```

현재 요구사항은 “채팅창만 열어놓는다”이므로 최초 구현에서는 아이콘 클릭 시 input을 비운다.

전송:

```text
submit
→ trim(message)
→ 빈 값이면 전송하지 않음
→ console.log(message)
→ 추후 mutation으로 교체 가능하게 onSubmit prop 분리
```

### 채팅 아이콘 상태

- Floating 채팅 아이콘은 Dialog open 여부와 무관하게 같은 아이콘을 유지한다.
- Dialog를 닫는 X는 Dialog header 안에만 둔다.

## 7. Feature 구조

```text
web/src/app/entity/wine-recommendation/
├─ model/
│  └─ wine-recommendation.type.ts
└─ api/
   ├─ wine-recommendation.mapper.ts
   └─ wine-recommendation.server.ts

web/src/app/feature/wine-recommendation-result/
└─ ui/
   ├─ WineRecommendationResultPage.tsx
   ├─ WineRecommendationResultClient.tsx
   ├─ WineRecommendationCarousel.tsx
   ├─ WineRecommendationCard.tsx
   ├─ FollowUpQuestionSection.tsx
   ├─ WineRecommendationChatDialog.tsx
   ├─ FloatingChatButton.tsx
   ├─ WineRecommendationResultPage.stories.tsx
   └─ wine-recommendation-result.props.ts
```

책임:

- entity API: 추천 결과 조회, DTO 검증, mapper
- page: 서버 조회 결과를 feature page에 전달
- result page: 정적 header와 client island 조합
- client: carousel/dialog/input 상태 관리
- carousel/card: 추천 와인 표시와 index 이동
- question section: 추가 질문 렌더링과 클릭 이벤트 전달
- chat dialog: Dialog UI, input, submit
- floating chat button: Dialog open trigger

## 8. 서버 조회 흐름

```text
wine/recommendations/page.tsx
→ getWineRecommendations()
→ requestServerApi("/wine-recommendations")
→ useMockApi=true이면 server-api가 /api/mock/wine-recommendations로 변환
→ DTO zod 검증
→ mapWineRecommendationsDto()
→ <WineRecommendationResultPage result={result} />
→ Client Component가 props로 캐러셀/질문/채팅 렌더링
```

`wine-recommendation.server.ts`는 `/wine-recommendations` 도메인 경로만 알고,
`/api/mock` 또는 `/api` prefix 결정은 `utils/http/server-api.ts`에서 담당한다.

현재 `server-api.ts`가 mock 모드에서 모든 요청을 `/api/mock/` 하나로 보내는 구조라면,
P4 endpoint를 지원하기 위해 mock 모드에서도 path를 보존하도록 조정해야 한다.

예상 규칙:

```text
useMockApi=true
requestServerApi("/wine-preference-options")
→ http://localhost:3030/api/mock/

useMockApi=true
requestServerApi("/wine-recommendations")
→ http://localhost:3030/api/mock/wine-recommendations

useMockApi=false
requestServerApi("/wine-recommendations")
→ http://localhost:8080/api/wine-recommendations
```

## 9. 공통 UI 재사용

### Dialog

기존 공통 Dialog를 사용한다.

```text
web/src/app/shared/ui/molecule/dialog.tsx
```

필요하면 `className`, `overlayClassName`, `showCloseButton` 등 기존 공개 API를 확인하고
부족한 경우 공통 Dialog를 확장한다. 단, P4 전용 스타일이 많으면 feature 컴포넌트에서
className으로 조합하고, 공통 Dialog 자체에 도메인 스타일을 넣지 않는다.

### Button / Icon

- 전송 버튼, floating chat button은 기존 button atom이 목적에 맞으면 재사용한다.
- 아이콘은 기존 프로젝트에서 사용하는 `lucide-react`를 우선 사용한다.
- 별점은 `Star`, 채팅은 `MessageCircle`, sparkle은 `Sparkles`, 닫기는 `X`를 사용한다.

### Carousel

프로젝트에 기존 Carousel 컴포넌트가 없으므로 1차 구현은 자체 경량 carousel로 구현한다.

- `currentIndex` state
- 이전/다음 버튼
- indicator
- 3개 고정 데이터 기준 순환 이동

외부 carousel 라이브러리는 추가하지 않는다.

## 10. 접근성

- carousel 이전/다음 버튼은 `aria-label`을 제공한다.
- indicator는 장식이면 `aria-hidden`, 현재 슬라이드 정보를 별도로 제공한다.
- 질문 카드는 `button`으로 구현해 키보드 접근을 보장한다.
- floating chat button은 `aria-label="채팅 열기"`를 제공한다.
- Dialog는 Radix Dialog를 사용해 focus trap과 ESC close를 확보한다.
- Dialog title/description을 제공한다.
- 채팅 input은 명확한 label 또는 `aria-label`을 가진다.
- 전송 버튼은 빈 입력일 때 disabled 처리한다.

## 11. Storybook 범위

### `WineRecommendationCard`

- `Default`
- `LongName`
- `HighRating`
- `NoPrice`

### `WineRecommendationCarousel`

- `Default`
- `SecondSlide`
- `SingleWine`

### `FollowUpQuestionSection`

- `Default`
- `LongQuestion`
- `Empty`

### `WineRecommendationChatDialog`

- `Closed`
- `OpenEmpty`
- `OpenWithQuestion`
- `LongMessage`

### `WineRecommendationResultPage`

- `Default`
- `ChatOpen`
- `LongWineData`
- `EmptyRecommendations`

규칙:

- title은 `Feature/wine-recommendation-result/<ComponentName>` 형식을 사용한다.
- `Default`를 반드시 포함한다.
- page story는 `390 x 715` wrapper로 모바일 화면, floating button, Dialog 위치를 재현한다.
- story fixture는 mock API 계약과 같은 필드명을 사용한다.

## 12. 구현 순서

1. `mock-api/server.js`의 P4 mock endpoint 계약 확인
2. `server-api.ts` mock path 변환 규칙 보완
3. `wine-recommendation` entity 타입, mapper, server 조회 함수 작성
4. `/wine/recommendations/page.tsx` route 추가
5. `WineRecommendationResultPage` Server Component 작성
6. `WineRecommendationResultClient` 상태와 이벤트 작성
7. 추천 와인 카드와 carousel 작성
8. 추가 질문 섹션 작성
9. Dialog 기반 채팅 UI 작성
10. floating chat button 작성
11. `/wine/preferences` CTA 성공 흐름이 확정되면 `/wine/recommendations` 이동 연결
12. Storybook 작성
13. 모바일 viewport에서 p4_1, p4_2 디자인 비교
14. 구현 완료 후 `docs/`에 페이지 개발 문서 작성

## 13. 검증

```bash
cd web
npx tsc --noEmit
npm run build
npm run build-storybook
```

추가 확인:

- 추천 와인 3개가 캐러셀로 이동된다.
- rank, rating, koreanName, description, area, price가 표시된다.
- API 계약에 없는 UI 필드를 앱 모델에 억지로 추가하지 않는다.
- 질문 4개가 2열 grid로 표시된다.
- 질문 클릭 시 Dialog가 열리고 input에 질문 label이 들어간다.
- floating chat button 클릭 시 Dialog만 열린다.
- Dialog open 상태에서도 floating chat icon이 X로 바뀌지 않는다.
- Dialog header의 X로 닫을 수 있다.
- 빈 input은 전송되지 않는다.
- 전송 시 `console.log(message)`가 호출된다.
- Client Component에서 추천 결과 API를 재호출하지 않는다.
- 390px 모바일 폭에서 overflow가 발생하지 않는다.
- floating button이 주요 콘텐츠를 가리지 않는다.

## 14. 구현 전 확정이 필요한 항목

1. 실제 추천 결과 route가 `/wine/recommendations`가 맞는지
2. 추천 결과 API의 실제 endpoint와 method
3. 와인 이미지 필드가 API 계약에 추가되는지 여부
4. 캐러셀 이동 방식이 swipe까지 필요한지, 버튼 클릭만 필요한지
5. 채팅 API의 request/response 계약
6. 채팅 Dialog에서 기존 대화 history를 유지해야 하는지 여부
7. 하단 네비게이션이 필요한 다른 화면과의 공통 정책
