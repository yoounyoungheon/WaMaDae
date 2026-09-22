import { z } from "zod";

/**
 * 백엔드 와인 계약을 검증하는 zod 스키마.
 *
 * BFF Route Handler가 backend 응답을 그대로 흘리지 않고 이 스키마로 검증·정규화한 뒤
 * safe DTO로 반환하는 데 사용한다. 알 수 없는 필드는 제거하고, nullable 필드는
 * 계약대로 유지한다(`body`는 backend mapper 누락으로 null일 수 있다).
 */
export const winePriceSchema = z.object({
  amount: z.number(),
  currency: z.enum(["KRW", "USD", "EUR"]),
  currencySign: z.string(),
  koreanUnit: z.string(),
});

const nullableTasteScale = z.number().nullable().catch(null);

export const wineSchema = z.object({
  id: z.string().min(1),
  wineName: z.string().min(1),
  vintage: z.number().nullable().catch(null),
  alcohol: z.string().nullable().catch(null),
  price: z.array(winePriceSchema).nullable().catch(null),
  country: z.string().nullable().catch(null),
  region: z.string().nullable().catch(null),
  tannin: nullableTasteScale,
  body: nullableTasteScale,
  sweetness: nullableTasteScale,
  acid: nullableTasteScale,
  wineBottleImageUrl: z.string().nullable().catch(null),
});

export const extractedWineSchema = wineSchema.extend({
  confidence: z.number().catch(0),
  isCatalogMatched: z.boolean().catch(false),
});

export const wineMenuExtractResponseSchema = z.object({
  wines: z.array(extractedWineSchema),
});
