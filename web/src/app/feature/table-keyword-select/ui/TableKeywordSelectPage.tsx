"use client";

import { ChevronRight } from "lucide-react";
import Button from "@/app/shared/ui/atom/button";
import { cn } from "@/app/utils/style/helper";
import { useTableKeywordSelectController } from "../model/use-table-keyword-select-controller";
import SelectionSummary from "./SelectionSummary";
import TableKeywordGrid from "./TableKeywordGrid";
import type { TableKeywordSelectPageProps } from "./table-keyword-select.props";

export default function TableKeywordSelectPage({
  className,
}: TableKeywordSelectPageProps) {
  const {
    keywords,
    selectedKeywordIds,
    toggleKeyword,
    selectedCount,
    isCompleteEnabled,
    isPending,
    isError,
    errorMessage,
    retry,
  } = useTableKeywordSelectController();

  const hasKeywords = keywords.length > 0;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <main className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-7">
        <h2 className="text-[20px] font-bold leading-tight text-text-01">
          오늘 드실 음식을
          <br />
          선택해주세요
        </h2>
        <p className="mt-2 text-[13px] font-medium text-text-03">
          음식과 어울리는 와인을 추천해드릴게요
        </p>

        {isPending ? (
          <KeywordGridSkeleton />
        ) : isError ? (
          <ErrorState message={errorMessage} onRetry={retry} />
        ) : !hasKeywords ? (
          <EmptyState />
        ) : (
          <>
            <SelectionSummary selectedCount={selectedCount} className="mt-5" />
            <TableKeywordGrid
              className="mt-4"
              keywords={keywords}
              selectedKeywordIds={selectedKeywordIds}
              onToggleKeyword={toggleKeyword}
            />
          </>
        )}
      </main>

      <div className="shrink-0 border-t border-main-light-gray-600 bg-white px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
        <Button
          htmlType="button"
          variant="solid"
          type="primary"
          radius="lg"
          disabled={!isCompleteEnabled}
          className="h-12 w-full gap-1 text-[15px] font-bold"
        >
          완료
          <ChevronRight className="h-4 w-4" strokeWidth={2.4} aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function KeywordGridSkeleton() {
  return (
    <>
      <div className="mt-5 h-[46px] w-full animate-pulse rounded-xl bg-main-light-gray-500" />
      <ul className="mt-4 grid grid-cols-3 gap-3" aria-hidden>
        {Array.from({ length: 9 }).map((_, index) => (
          <li
            key={index}
            className="aspect-square animate-pulse rounded-2xl bg-main-light-gray-500"
          />
        ))}
      </ul>
      <span className="sr-only" role="status">
        테이블 키워드를 불러오는 중입니다.
      </span>
    </>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="mt-8 flex flex-col items-center gap-4 rounded-xl bg-white px-6 py-10 text-center shadow-sm"
    >
      <p className="text-[14px] font-medium text-text-02">
        {message ?? "테이블 키워드를 불러오지 못했습니다."}
      </p>
      <Button
        htmlType="button"
        variant="outline"
        type="primary"
        radius="lg"
        className="px-5 py-2 text-[13px] font-bold"
        onClick={onRetry}
      >
        다시 시도
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 flex flex-col items-center gap-2 rounded-xl bg-white px-6 py-10 text-center shadow-sm">
      <p className="text-[14px] font-medium text-text-02">
        선택할 수 있는 테이블 키워드가 없어요
      </p>
      <p className="text-[13px] font-medium text-text-03">
        잠시 후 다시 확인해주세요
      </p>
    </div>
  );
}
