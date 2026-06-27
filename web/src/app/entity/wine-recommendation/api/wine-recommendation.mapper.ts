import type {
  GetWineRecommendationsResponseDto,
  WineRecommendationResult,
} from "../model/wine-recommendation.type";

export function mapWineRecommendationsDto(
  dto: GetWineRecommendationsResponseDto
): WineRecommendationResult {
  return {
    wines: dto.data.wines,
    followUpQuestions: dto.data.followUpQuestions,
    chat: dto.data.chat,
  };
}
