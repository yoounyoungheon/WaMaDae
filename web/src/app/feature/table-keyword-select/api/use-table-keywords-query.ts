"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTableKeywords } from "@/app/entity/table-keyword/api/table-keyword.api";
import { tableKeywordQueryKeys } from "./table-keyword-query-keys";

// 키워드 목록은 변경 빈도가 낮으므로 긴 staleTime을 사용한다.
const TABLE_KEYWORD_STALE_TIME = 1000 * 60 * 60;

export function useTableKeywordsQuery() {
  return useQuery({
    queryKey: tableKeywordQueryKeys.list(),
    queryFn: ({ signal }) => fetchTableKeywords(signal),
    staleTime: TABLE_KEYWORD_STALE_TIME,
  });
}
