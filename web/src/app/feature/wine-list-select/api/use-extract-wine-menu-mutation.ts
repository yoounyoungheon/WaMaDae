"use client";

import { useMutation } from "@tanstack/react-query";
import { extractWineMenu } from "@/app/entity/wine/api/wine.api";
import type { ExtractedWine } from "@/app/entity/wine/model/wine.type";

export type ExtractWineMenuVariables = {
  sessionId: string;
  files: File[];
};

/**
 * 와인 메뉴 추출 mutation.
 *
 * 자동 재시도는 OCR 비용과 유령 세션 생성을 늘릴 수 있으므로 `retry: 0`으로 둔다.
 * 재시도는 항상 새 세션 UUID로 사용자가 명시적으로 수행한다.
 */
export function useExtractWineMenuMutation() {
  return useMutation<ExtractedWine[], Error, ExtractWineMenuVariables>({
    mutationFn: ({ sessionId, files }) => extractWineMenu(sessionId, files),
    retry: 0,
  });
}
