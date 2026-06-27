export type RecommendedWine = {
  id: number;
  koreanName: string;
  englishName: string;
  price: string;
  description: string;
  area: string;
  rating: number;
  rank: number;
};

export type FollowUpQuestion = {
  id: number;
  label: string;
};

export type WineRecommendationChatGuide = {
  greetingMessage: string;
  sampleAnswer: string;
};

export type WineRecommendationResult = {
  wines: RecommendedWine[];
  followUpQuestions: FollowUpQuestion[];
  chat: WineRecommendationChatGuide;
};

export type RecommendedWineDto = RecommendedWine;

export type FollowUpQuestionDto = FollowUpQuestion;

export type GetWineRecommendationsResponseDto = {
  data: {
    wines: RecommendedWineDto[];
    followUpQuestions: FollowUpQuestionDto[];
    chat: WineRecommendationChatGuide;
  };
};
