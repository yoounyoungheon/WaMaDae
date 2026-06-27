# Wine Recommendations API

맞춤 와인 추천 결과 조회 API 계약이다. 이 문서는 mock server 구현 세부사항을 포함하지
않고 요청/응답 DTO만 정의한다.

## GET /api/wine-recommendations

### Request

현재 요청 query/body 계약은 확정되지 않았다. 1차 구현에서는 서버가 현재 추천 flow
context를 기준으로 추천 결과를 반환한다고 가정한다.

### Response

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

### Field Rules

- `wines`는 추천 순위 기준 3개를 반환한다.
- `wines[].id`는 와인 식별자다.
- `wines[].rank`는 추천 순위다.
- `wines[].price`는 화면 표시용 가격 문자열이다.
- `wines[].rating`은 별점 숫자다.
- `followUpQuestions`는 화면에 표시할 추가 질문 4개를 반환한다.
- `followUpQuestions[].id`는 숫자 식별자다.
- `followUpQuestions[].label`은 질문 버튼과 채팅 input 자동 입력에 사용한다.
- 채팅 전송 API는 아직 별도 계약이 없다.
