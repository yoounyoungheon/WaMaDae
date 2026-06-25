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
      <h2 className="text-[12px] font-bold text-text-02">와인 검색하여 추가</h2>

      <div
        className={cn(
          "mt-3 w-full [&_input]:h-11 [&_input]:rounded-xl [&_input]:border-2 [&_input]:bg-white [&_input]:py-2 [&_input]:pl-11 [&_input]:pr-4 [&_input]:text-[13px] [&_input]:font-medium [&_input]:text-text-01 [&_input]:shadow-sm [&_input]:placeholder:text-text-04",
          errorMessage
            ? "[&_input]:!border-error-main"
            : "[&_input]:!border-primary-main focus-within:[&_input]:!border-primary-action"
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
      ) : (
        <WineSearchResultList
          results={results}
          selectedWineIds={selectedWineIds}
          className="mt-2"
          onSelectWine={onSelectWine}
        />
      )}
    </section>
  );
}
