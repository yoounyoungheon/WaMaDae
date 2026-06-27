import "server-only";

import { z } from "zod";
import {
  parseServerApiError,
  requestServerApi,
} from "@/app/utils/http/server-api";
import { mapWineRecommendationsDto } from "./wine-recommendation.mapper";
import type {
  GetWineRecommendationsResponseDto,
  WineRecommendationResult,
} from "../model/wine-recommendation.type";

const recommendedWineSchema = z.object({
  id: z.number(),
  koreanName: z.string().min(1),
  englishName: z.string().min(1),
  price: z.string().min(1),
  description: z.string().min(1),
  area: z.string().min(1),
  rating: z.number(),
  rank: z.number(),
});

const followUpQuestionSchema = z.object({
  id: z.number(),
  label: z.string().min(1),
});

const responseSchema = z.object({
  data: z.object({
    wines: z.array(recommendedWineSchema),
    followUpQuestions: z.array(followUpQuestionSchema),
    chat: z.object({
      greetingMessage: z.string().min(1),
      sampleAnswer: z.string().min(1),
    }),
  }),
});

const DEFAULT_ERROR_MESSAGE = "추천 와인을 불러오지 못했습니다.";
const WINE_RECOMMENDATIONS_PATH =
  process.env.WINE_RECOMMENDATIONS_PATH ?? "/wine-recommendations";

export async function getWineRecommendations(): Promise<WineRecommendationResult> {
  const response = await requestServerApi(WINE_RECOMMENDATIONS_PATH, {
    headers: {
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    const message = await parseServerApiError(response);
    throw new Error(message ?? DEFAULT_ERROR_MESSAGE);
  }

  const parsed = responseSchema.safeParse(await response.json());

  if (!parsed.success) {
    throw new Error(DEFAULT_ERROR_MESSAGE);
  }

  return mapWineRecommendationsDto(
    parsed.data as GetWineRecommendationsResponseDto
  );
}
