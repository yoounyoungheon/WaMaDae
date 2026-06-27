import type {
  FollowUpQuestion,
  RecommendedWine,
  WineRecommendationChatGuide,
  WineRecommendationResult,
} from "@/app/entity/wine-recommendation/model/wine-recommendation.type";

export interface WineRecommendationResultPageProps {
  result: WineRecommendationResult;
  className?: string;
}

export interface WineRecommendationResultClientProps {
  result: WineRecommendationResult;
  className?: string;
}

export interface WineRecommendationCarouselProps {
  wines: RecommendedWine[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

export interface WineRecommendationCardProps {
  wine: RecommendedWine;
  className?: string;
}

export interface FollowUpQuestionSectionProps {
  questions: FollowUpQuestion[];
  onQuestionClick: (question: FollowUpQuestion) => void;
  className?: string;
}

export interface WineRecommendationChatDialogProps {
  open: boolean;
  inputValue: string;
  chat: WineRecommendationChatGuide;
  selectedQuestionLabel?: string;
  onOpenChange: (open: boolean) => void;
  onInputChange: (value: string) => void;
  onSubmit: (message: string) => void;
}
