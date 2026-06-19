"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type {
  MenuImagePreview,
  Wine,
  WineSearchItem,
} from "@/app/entity/wine/model/wine.type";
import { getWineMenuImageValidationMessage } from "@/app/entity/wine/model/wine-menu-image";
import { useAnalyzeWineListMutation } from "../api/use-analyze-wine-list-mutation";
import { useKnownWinesQuery } from "../api/use-known-wines-query";
import { useWineSearchQuery } from "../api/use-wine-search-query";
import { cacheKnownWines } from "../lib/cache-known-wines";
import { useDebouncedValue } from "./use-debounced-value";
import { useWineListSelectionStore } from "./wine-list-selection-provider";

const SEARCH_DEBOUNCE_MS = 200;

/**
 * Feature 조합 hook.
 * 로컬 UI 상태, Query/Mutation 결과, Zustand action을 화면이 쓰기 좋은 형태로 조합한다.
 * 서버 응답 배열이나 수동 로딩 상태는 보관하지 않는다.
 */
export function useWineListSelectController() {
  const queryClient = useQueryClient();

  // 로컬 UI 상태
  const [query, setQuery] = useState("");
  const [isPhotoSectionOpen, setIsPhotoSectionOpen] = useState(true);
  const [menuImagePreview, setMenuImagePreview] =
    useState<MenuImagePreview | null>(null);
  const [imageErrorMessage, setImageErrorMessage] = useState<string | null>(
    null
  );
  const menuImageFileRef = useRef<File | null>(null);
  const previewUrlRef = useRef<string | undefined>(undefined);

  // 검색 서버 상태
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const searchQuery = useWineSearchQuery(debouncedQuery);

  // 선택 클라이언트 draft (selector로 필요한 값/action만 구독)
  const selectedWineIds = useWineListSelectionStore(
    (state) => state.selectedWineIds
  );
  const addWineId = useWineListSelectionStore((state) => state.addWineId);
  const replaceWineIds = useWineListSelectionStore(
    (state) => state.replaceWineIds
  );
  const removeWineId = useWineListSelectionStore((state) => state.removeWineId);

  // 검색/분석으로 이미 받은 와인 데이터 cache
  const { data: knownWines } = useKnownWinesQuery();
  const selectedWines = selectedWineIds
    .map((wineId) => knownWines[wineId])
    .filter((wine): wine is Wine => Boolean(wine));

  // 분석 서버 상태
  const {
    mutate: analyzeWineList,
    reset: resetAnalysis,
    isPending: isAnalyzing,
    error: analysisError,
  } = useAnalyzeWineListMutation();

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleImageChange = useCallback((file: File | null) => {
    resetAnalysis();

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = undefined;
    }

    menuImageFileRef.current = file;

    if (!file) {
      setMenuImagePreview(null);
      setImageErrorMessage(null);
      return;
    }

    const validationMessage = getWineMenuImageValidationMessage(file);
    if (validationMessage) {
      menuImageFileRef.current = null;
      setMenuImagePreview(null);
      setImageErrorMessage(validationMessage);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setMenuImagePreview({ fileName: file.name, previewUrl });
    setImageErrorMessage(null);
  }, [resetAnalysis]);

  const handleSelectWine = useCallback(
    (wine: WineSearchItem) => {
      // WineSearchItem은 카드 렌더링에 필요한 Wine 필드를 모두 포함한다.
      cacheKnownWines(queryClient, [wine]);
      addWineId(wine.id);
    },
    [queryClient, addWineId]
  );

  const handleAnalyze = useCallback(() => {
    const file = menuImageFileRef.current;
    if (!file) return;

    analyzeWineList(file, {
      onSuccess: (wines) => {
        cacheKnownWines(queryClient, wines);
        replaceWineIds(wines.map((wine) => wine.id));
        setIsPhotoSectionOpen(false);
      },
    });
  }, [analyzeWineList, queryClient, replaceWineIds]);

  const handleRemoveWine = useCallback(
    (wineId: string) => {
      removeWineId(wineId);
    },
    [removeWineId]
  );

  return {
    // 로컬 UI 상태
    query,
    setQuery,
    isPhotoSectionOpen,
    setIsPhotoSectionOpen,
    menuImagePreview,
    // 검색
    searchResults: searchQuery.data ?? [],
    isSearching: searchQuery.isFetching,
    searchErrorMessage: getRequestErrorMessage(searchQuery.error),
    // 선택
    selectedWineIds,
    selectedWines,
    // 분석
    isAnalyzing,
    analysisErrorMessage:
      imageErrorMessage ?? getRequestErrorMessage(analysisError),
    // 이벤트
    handleImageChange,
    handleAnalyze,
    handleSelectWine,
    handleRemoveWine,
  };
}

function getRequestErrorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}
