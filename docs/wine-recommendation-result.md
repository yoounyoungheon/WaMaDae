# 맞춤 와인 추천 결과 페이지 구조 및 데이터 흐름

`/wine/recommendations` 화면의 추천 결과 렌더링, 캐러셀, 후속 질문 채팅 Dialog 구조를
정리한다. 기준 구현은
`feature/wine-recommendation-result/ui/WineRecommendationResultPage.tsx`이며, API 계약은
`api/wine-recommendations.md`, 설계 배경은 `plans/P4_PLAN.md`를 참고한다.

## 1. 페이지 구조

```text
wine/recommendations/page.tsx              [Server Component]
└─ WineRecommendationResultPage            [Server Component]
   ├─ PageHeader                           공통 헤더
   └─ WineRecommendationResultClient       [Client Component]
      ├─ WineRecommendationCarousel        캐러셀 상태
      ├─ FollowUpQuestionSection           질문 클릭
      ├─ FloatingChatButton                채팅 열기
      └─ WineRecommendationChatDialog      Dialog/input/submit
```

- `page.tsx`는 Server Component로 유지한다.
- 상단 헤더는 `shared/ui/molecule/page-header.tsx` 공통 컴포넌트의 기본 레이아웃을 사용해
  `/wine/ai` 페이지와 높이와 위치를 맞춘다.
- 추천 결과는 서버에서 한 번 조회한 뒤 직렬화 가능한 props로 하위 Client Component에
  전달한다.
- Client Component는 추천 결과 API를 재호출하지 않고, 캐러셀 index와 채팅 Dialog 상태만
  관리한다.

## 2. 서버 데이터

추천 결과 계약:

```http
GET /api/wine-recommendations
```

앱 모델:

```ts
type WineRecommendationResult = {
  wines: RecommendedWine[];
  followUpQuestions: FollowUpQuestion[];
  chat: {
    greetingMessage: string;
    sampleAnswer: string;
  };
};
```

데이터 흐름:

```text
wine/recommendations/page.tsx
→ getWineRecommendations()
→ requestServerApi("/wine-recommendations")
→ 응답 DTO zod 검증
→ mapWineRecommendationsDto()
→ WineRecommendationResultPage result props
→ WineRecommendationResultClient result props
```

- `wine-recommendation.server.ts`는 `/wine-recommendations` 도메인 경로만 알고,
  `/api` prefix와 `http://localhost:8080` base URL 조합은 `utils/http/server-api.ts`가 담당한다.
- 최종 요청 URL은 `http://localhost:8080/api/wine-recommendations`이다.

## 3. 클라이언트 상태

P4 상태는 화면 내부 상호작용에만 필요하므로 Zustand를 사용하지 않는다.

```ts
type RecommendationClientState = {
  currentWineIndex: number;
  isChatOpen: boolean;
  chatInputValue: string;
  selectedQuestionLabel?: string;
};
```

- `currentWineIndex`는 캐러셀 현재 카드 index다.
- `isChatOpen`은 Dialog open 여부다.
- `chatInputValue`는 채팅 input 값이다.
- `selectedQuestionLabel`은 질문 클릭으로 열린 경우 사용자 말풍선에 표시할 label이다.

이벤트:

- 질문 클릭: input에 질문 label을 넣고 Dialog를 연다.
- floating 채팅 버튼 클릭: Dialog만 열고 floating icon은 그대로 유지한다.
- 전송: 빈 문자열은 무시하고, 현재는 `console.log(message)`만 실행한다.

## 4. UI와 접근성

- 추천 와인 카드는 rank, rating, koreanName, description, area, price를 표시한다.
- API 계약에 이미지 필드가 없으므로 카드 배경 이미지는 UI fallback으로만 사용한다.
- 캐러셀 이전/다음 버튼에는 `aria-label`을 제공한다.
- 질문 카드는 `button`으로 구현해 키보드 접근을 보장한다.
- floating 채팅 버튼은 `aria-label="채팅 열기"`를 가진다.
- 채팅 Dialog는 Radix Dialog 기반 공통 primitive를 사용한다.
- Dialog overlay는 P4 디자인에 맞춰 투명하게 설정한다.
- 채팅 input은 label을 `sr-only`로 제공한다.
- 빈 입력이면 전송 버튼을 disabled 처리한다.

## 5. Storybook

- `Feature/wine-recommendation-result/WineRecommendationResultPage`
  - 기본, 빈 결과, 긴 와인 데이터
- `Feature/wine-recommendation-result/WineRecommendationChatDialog`
  - 빈 input open, 질문 자동 입력 open

페이지 story는 `390 x 715` wrapper로 모바일 화면, floating chat button, Dialog 위치를
재현한다.
