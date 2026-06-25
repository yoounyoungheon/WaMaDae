import "server-only";

import { z } from "zod";
import {
  parseServerApiError,
  requestServerApi,
} from "@/app/utils/http/server-api";
import { mapWinePreferenceOptionsDto } from "./wine-preference.mapper";
import type {
  GetWinePreferenceOptionsResponseDto,
  WinePreferenceOptions,
} from "../model/wine-preference.type";

const preferenceOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  iconPath: z.string().min(1).optional(),
});

const responseSchema = z.object({
  data: z.object({
    mood: z.array(preferenceOptionSchema),
    alcohol: z.array(preferenceOptionSchema),
    pairingFood: z.array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
        options: z.array(preferenceOptionSchema),
      })
    ),
  }),
});

const DEFAULT_ERROR_MESSAGE = "추천 선택지를 불러오지 못했습니다.";
const WINE_PREFERENCE_OPTIONS_PATH =
  process.env.WINE_PREFERENCE_OPTIONS_PATH ?? "/wine-preference-options";

export async function getWinePreferenceOptions(): Promise<WinePreferenceOptions> {
  const response = await requestServerApi(WINE_PREFERENCE_OPTIONS_PATH, {
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

  return mapWinePreferenceOptionsDto(
    parsed.data as GetWinePreferenceOptionsResponseDto
  );
}
