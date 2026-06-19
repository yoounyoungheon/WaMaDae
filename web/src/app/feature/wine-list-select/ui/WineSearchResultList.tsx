import { cn } from "@/app/utils/style/helper";
import WineSearchResultItem from "./WineSearchResultItem";
import type { WineSearchResultListProps } from "./wine-list-select.props";

const DEFAULT_EMPTY_MESSAGE = "검색 결과가 없습니다.";

export default function WineSearchResultList({
  results,
  selectedWineIds,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  onSelectWine,
  className,
}: WineSearchResultListProps) {
  if (results.length === 0) {
    return (
      <div
        className={cn(
          "w-full rounded-xl border border-main-light-gray-600 bg-white px-4 py-6 text-center text-[12px] font-medium text-text-03 shadow-md",
          className
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul
      className={cn(
        "w-full overflow-hidden rounded-xl border border-main-light-gray-600 bg-white shadow-md",
        className
      )}
    >
      {results.map((wine, index) => (
        <li
          key={wine.id}
          className={cn(
            index < results.length - 1 && "border-b border-main-light-gray-600"
          )}
        >
          <WineSearchResultItem
            wine={wine}
            isSelected={selectedWineIds.includes(wine.id)}
            onSelect={onSelectWine}
          />
        </li>
      ))}
    </ul>
  );
}
