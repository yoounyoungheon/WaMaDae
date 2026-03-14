"use client";

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import WineCard from "./WineCard";
import Button from "@/app/shared/ui/atom/button";
import TextInput from "@/app/shared/ui/atom/text-input";
import { cn } from "@/app/utils/style/helper";

export interface WineSearcherItem {
  name: string;
  description: string;
  imageUrl: string;
  priceLabel: string;
}

export interface WineSearcherCompletedPayload {
  query: string;
  wines: WineSearcherItem[];
  selectedWines: WineSearcherItem[];
}

export interface WineSearcherProps {
  isSearchEnabled?: boolean;
  fetchWineSearch: (query: string) => Promise<WineSearcherItem[]>;
  onCompleted: (payload: WineSearcherCompletedPayload) => void;
  searchPlaceholder?: string;
  preSearchMessage?: string;
  emptyResultMessage?: string;
  completeLabel?: string;
  initialQuery?: string;
  initialResults?: WineSearcherItem[];
  className?: string;
}

export default function WineSearcher({
  isSearchEnabled = true,
  fetchWineSearch,
  onCompleted,
  searchPlaceholder = "와인 이름을 검색해보세요.",
  preSearchMessage = "메뉴판에 있는 와인 명을 직접 입력해 추가해보세요.",
  emptyResultMessage = "검색 결과가 없어요. 와인 이름을 다시 확인해보세요.",
  completeLabel = "완료",
  initialQuery = "",
  initialResults = [],
  className,
}: WineSearcherProps) {
  const [query, setQuery] = useState(initialQuery);
  const [wines, setWines] = useState<WineSearcherItem[]>(initialResults);
  const [hasSearched, setHasSearched] = useState(
    initialQuery.trim().length > 0 || initialResults.length > 0,
  );
  const [lastSearchedQuery, setLastSearchedQuery] = useState(
    initialQuery.trim().length > 0 ? initialQuery.trim() : null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedWines, setSelectedWines] = useState<WineSearcherItem[]>([]);
  const requestIdRef = useRef(0);

  const getWineKey = (wine: WineSearcherItem) =>
    `${wine.name}-${wine.priceLabel}-${wine.imageUrl}`;

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    requestIdRef.current += 1;
    setWines(initialResults);
    setSelectedWines([]);
    setHasSearched(initialQuery.trim().length > 0 || initialResults.length > 0);
    setLastSearchedQuery(
      initialQuery.trim().length > 0 ? initialQuery.trim() : null,
    );
    setErrorMessage(null);
    setIsSearching(false);
  }, [initialQuery, initialResults]);

  const trimmedQuery = query.trim();
  const canSearch = isSearchEnabled && !isSearching && trimmedQuery.length > 0;
  const hasSyncedResults =
    lastSearchedQuery !== null && lastSearchedQuery === trimmedQuery;
  const wineKeySet = useMemo(
    () => new Set(wines.map((wine) => getWineKey(wine))),
    [wines],
  );
  const selectedWineKeySet = useMemo(
    () => new Set(selectedWines.map((wine) => getWineKey(wine))),
    [selectedWines],
  );
  const canComplete =
    isSearchEnabled &&
    !isSearching &&
    selectedWines.length > 0 &&
    hasSyncedResults;

  const helperMessages = useMemo(
    () => (errorMessage ? [errorMessage] : undefined),
    [errorMessage],
  );

  useEffect(() => {
    setSelectedWines((prev) =>
      prev.filter((selectedWine) => wineKeySet.has(getWineKey(selectedWine))),
    );
  }, [wineKeySet]);

  const handleToggle = (wine: WineSearcherItem) => {
    const wineKey = getWineKey(wine);
    const isSelected = selectedWineKeySet.has(wineKey);

    if (isSelected) {
      setSelectedWines((prev) =>
        prev.filter((selectedWine) => getWineKey(selectedWine) !== wineKey),
      );
      return;
    }

    setSelectedWines((prev) => [...prev, wine]);
  };

  const handleAllSelect = () => {
    setSelectedWines(wines);
  };

  const handleAllDeSelect = () => {
    setSelectedWines([]);
  };

  const handleSearch = async () => {
    if (!canSearch) return;

    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;

    setIsSearching(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      const results = await fetchWineSearch(trimmedQuery);

      if (requestIdRef.current !== currentRequestId) return;

      setWines(results);
      setSelectedWines([]);
      setLastSearchedQuery(trimmedQuery);
    } catch {
      if (requestIdRef.current !== currentRequestId) return;

      setWines([]);
      setSelectedWines([]);
      setLastSearchedQuery(trimmedQuery);
      setErrorMessage("검색 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setIsSearching(false);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSearch();
  };

  return (
    <section
      className={cn(
        "flex w-full max-w-md flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <form className="w-full" onSubmit={handleSubmit}>
        <TextInput
          type="text"
          value={query}
          placeholder={searchPlaceholder}
          withIcon={MagnifyingGlassIcon}
          onIconClick={canSearch ? () => void handleSearch() : undefined}
          onValueChange={(value) => {
            setQuery(value);
            if (
              lastSearchedQuery !== null &&
              value.trim() !== lastSearchedQuery
            ) {
              setWines([]);
              setSelectedWines([]);
              setHasSearched(false);
            }
            if (errorMessage) {
              setErrorMessage(null);
            }
          }}
          helperMessages={helperMessages}
          status={errorMessage ? "error" : "default"}
          disabled={!isSearchEnabled || isSearching}
          aria-label="와인 검색 입력"
        />
      </form>

      <div className="min-h-[280px] flex-1 rounded-[24px] bg-slate-50/70 p-3">
        {wines.length > 0 ? (
          <div className="grid h-full grid-cols-3 gap-3">
            <div className="col-span-3 flex items-center justify-end">
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  className="text-slate-700 hover:text-slate-900"
                  onClick={handleAllSelect}
                >
                  모두 선택
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  className="text-slate-700 hover:text-slate-900"
                  onClick={handleAllDeSelect}
                >
                  모두 해제
                </button>
              </div>
            </div>

            <div className="col-span-3 grid grid-cols-1 gap-2">
              {wines.map((wine, index) => {
                const isSelected = selectedWineKeySet.has(getWineKey(wine));

                return (
                  <button
                    key={`${getWineKey(wine)}-${index}`}
                    type="button"
                    className="w-full text-left"
                    onClick={() => handleToggle(wine)}
                  >
                    <WineCard {...wine} isSelected={isSelected} />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[248px] items-center justify-center px-6 text-center">
            <p className="text-sm leading-6 text-slate-600">
              {hasSearched ? emptyResultMessage : preSearchMessage}
            </p>
          </div>
        )}
      </div>

      <Button
        variant="solid"
        type="primary"
        radius="lg"
        className="w-full"
        disabled={!canComplete}
        onClick={() =>
          onCompleted({
            query: trimmedQuery,
            wines,
            selectedWines,
          })
        }
      >
        {isSearching ? "검색 중..." : completeLabel}
      </Button>
    </section>
  );
}
