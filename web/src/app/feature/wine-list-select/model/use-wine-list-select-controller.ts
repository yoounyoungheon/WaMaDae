"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clearDownstreamWorkflowSnapshots } from "@/app/entity/wine-pairing-workflow/lib/workflow-snapshot-storage";
import {
  isSameFile,
  validateWineMenuImageAddition,
} from "@/app/entity/wine/model/wine-menu-image";
import type { MenuImagePreview } from "@/app/entity/wine/model/wine.type";
import { generateUuid } from "@/app/utils/crypto/generate-uuid";
import { useExtractWineMenuMutation } from "../api/use-extract-wine-menu-mutation";
import { useWineListSelectionStore } from "./wine-list-selection-provider";

/**
 * `/wine/list` 조합 hook.
 *
 * - 선택 파일과 preview URL은 컴포넌트 로컬 상태로 관리하고 제거/언마운트 시 revoke한다.
 * - 추출 서버 상태는 TanStack Query mutation이 소유한다(useState로 복제하지 않는다).
 * - 선택 wine ID와 세션 ID는 플로우 Zustand store가 소유한다.
 */
export function useWineListSelectController() {
  const [previews, setPreviews] = useState<MenuImagePreview[]>([]);
  const [imageErrorMessage, setImageErrorMessage] = useState<string | null>(
    null
  );
  const previewsRef = useRef<MenuImagePreview[]>([]);
  previewsRef.current = previews;

  const sessionId = useWineListSelectionStore((state) => state.sessionId);
  const selectedWineIds = useWineListSelectionStore(
    (state) => state.selectedWineIds
  );
  const startSession = useWineListSelectionStore((state) => state.startSession);
  const toggleWineId = useWineListSelectionStore((state) => state.toggleWineId);

  const {
    mutate: extractWineMenu,
    reset: resetExtraction,
    data: extractedWines,
    isPending: isExtracting,
    isSuccess: hasExtractionResult,
    error: extractionError,
  } = useExtractWineMenuMutation();

  useEffect(() => {
    return () => {
      for (const preview of previewsRef.current) {
        URL.revokeObjectURL(preview.previewUrl);
      }
    };
  }, []);

  const handleAddFiles = useCallback(
    (incoming: File[]) => {
      if (incoming.length === 0) return;
      resetExtraction();

      const existingFiles = previewsRef.current.map((preview) => preview.file);
      const additions = incoming.filter(
        (file) => !existingFiles.some((current) => isSameFile(current, file))
      );
      if (additions.length === 0) {
        return;
      }

      const validationError = validateWineMenuImageAddition(
        existingFiles,
        additions
      );
      if (validationError) {
        setImageErrorMessage(validationError.message);
        return;
      }

      setImageErrorMessage(null);
      const nextPreviews = additions.map<MenuImagePreview>((file) => ({
        id: generateUuid(),
        file,
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
      }));
      setPreviews((current) => [...current, ...nextPreviews]);
    },
    [resetExtraction]
  );

  const handleRemoveFile = useCallback(
    (id: string) => {
      resetExtraction();
      setImageErrorMessage(null);
      setPreviews((current) => {
        const removed = current.find((preview) => preview.id === id);
        if (removed) {
          URL.revokeObjectURL(removed.previewUrl);
        }
        return current.filter((preview) => preview.id !== id);
      });
    },
    [resetExtraction]
  );

  const handleAnalyze = useCallback(() => {
    const files = previewsRef.current.map((preview) => preview.file);
    if (files.length === 0 || isExtracting) return;

    // 분석마다 새 세션 UUID를 생성한다. 실패한 세션 ID는 재사용하지 않는다.
    const nextSessionId = generateUuid();
    extractWineMenu(
      { sessionId: nextSessionId, files },
      {
        onSuccess: (wines) => {
          // 이전 단계로 넘어갈 stale snapshot을 초기화하고 새 세션을 커밋한다.
          // BFF에서 이미 노출 대상만 걸러 내려주므로 반환된 와인을 모두 기본 선택한다.
          clearDownstreamWorkflowSnapshots();
          startSession(
            nextSessionId,
            wines.map((wine) => wine.id)
          );
        },
      }
    );
  }, [extractWineMenu, isExtracting, startSession]);

  const wines = extractedWines ?? [];
  const selectedWineIdSet = new Set(selectedWineIds);
  const selectedWines = wines.filter((wine) => selectedWineIdSet.has(wine.id));

  return {
    previews,
    imageErrorMessage,
    isExtracting,
    hasExtractionResult,
    extractionErrorMessage:
      extractionError instanceof Error ? extractionError.message : null,
    wines,
    sessionId,
    selectedWineIds,
    selectedWines,
    canProceed: Boolean(sessionId) && selectedWineIds.length > 0,
    handleAddFiles,
    handleRemoveFile,
    handleAnalyze,
    handleToggleWine: toggleWineId,
  };
}
