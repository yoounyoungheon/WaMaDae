"use client";

import { useTableKeywordsQuery } from "../api/use-table-keywords-query";
import { useTableKeywordSelectionStore } from "./table-keyword-selection-provider";

const DEFAULT_ERROR_MESSAGE = "테이블 키워드를 불러오지 못했습니다.";

/**
 * Feature 조합 hook.
 * 서버 키워드 목록(Query)과 선택 draft(Zustand)를 화면이 쓰기 좋은 형태로 조합한다.
 * 서버 응답 배열이나 선택 개수를 별도 상태로 복제하지 않는다.
 */
export function useTableKeywordSelectController() {
  const {
    data: keywords = [],
    isPending,
    isError,
    error,
    refetch,
  } = useTableKeywordsQuery();

  const selectedKeywordIds = useTableKeywordSelectionStore(
    (state) => state.selectedKeywordIds
  );
  const toggleKeyword = useTableKeywordSelectionStore(
    (state) => state.toggleKeyword
  );

  // 파생 값: 별도 상태로 저장하지 않는다.
  const selectedCount = selectedKeywordIds.length;

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : DEFAULT_ERROR_MESSAGE
    : null;

  return {
    keywords,
    selectedKeywordIds,
    toggleKeyword,
    selectedCount,
    isPending,
    isError,
    errorMessage,
    retry: refetch,
  };
}
