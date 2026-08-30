import { Search } from "lucide-react";
import { cn } from "@/app/utils/style/helper";
import TextInput from "@/app/shared/ui/atom/text-input";
import WineSearchResultList from "./WineSearchResultList";
import type { WineSearchSectionProps } from "./wine-list-select.props";

export default function WineSearchSection({
  query,
  results,
  selectedWineIds,
  isLoading = false,
  errorMessage,
  onQueryChange,
  onSelectWine,
  className,
}: WineSearchSectionProps) {
  return (
    <section className={cn("w-full", className)}>
      <h2 className="text-[16px] font-bold text-ink-emphasis">
        와인 이름으로 직접 담기
      </h2>

      <div
        className={cn(
          "mt-3 w-full [&_.relative>div]:!bg-transparent [&_input]:h-[52px] [&_input]:rounded-[18px] [&_input]:border [&_input]:border-white/80 [&_input]:bg-white/45 [&_input]:py-2 [&_input]:pl-12 [&_input]:pr-4 [&_input]:text-[14px] [&_input]:font-medium [&_input]:text-ink-page [&_input]:shadow-[0_10px_26px_rgba(72,52,112,0.06)] [&_input]:backdrop-blur-sm [&_input]:placeholder:text-ink-muted",
          errorMessage
            ? "[&_input]:!border-error-main"
            : "focus-within:[&_input]:!border-primary"
        )}
      >
        <TextInput
          type="text"
          value={query}
          placeholder="와인 이름 검색"
          aria-label="와인 검색어"
          suppressHydrationWarning
          withIcon={Search}
          status={errorMessage ? "error" : "default"}
          onValueChange={onQueryChange}
        />
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="mt-2 w-full rounded-xl border border-error-cancel bg-white px-4 py-6 text-center text-[12px] font-medium text-error-main shadow-md"
        >
          {errorMessage}
        </div>
      ) : isLoading ? (
        <div className="mt-2 w-full rounded-xl border border-main-light-gray-600 bg-white px-4 py-6 text-center text-[12px] font-medium text-text-03 shadow-md">
          검색 중입니다.
        </div>
      ) : query.trim().length > 0 ? (
        <WineSearchResultList
          results={results}
          selectedWineIds={selectedWineIds}
          className="mt-2"
          onSelectWine={onSelectWine}
        />
      ) : null}
    </section>
  );
}
