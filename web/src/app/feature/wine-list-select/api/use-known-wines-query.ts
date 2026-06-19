"use client";

import { useQuery } from "@tanstack/react-query";
import type { KnownWines } from "../lib/cache-known-wines";
import { wineQueryKeys } from "./wine-query-keys";

const EMPTY_KNOWN_WINES: KnownWines = {};

/**
 * 검색 또는 분석 응답으로 이미 받은 와인 데이터를 구독한다.
 * 이 cache는 네트워크 요청을 발생시키지 않는다.
 */
export function useKnownWinesQuery() {
  return useQuery<KnownWines>({
    queryKey: wineQueryKeys.known(),
    queryFn: async () => EMPTY_KNOWN_WINES,
    initialData: EMPTY_KNOWN_WINES,
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
