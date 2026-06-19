import { Wine } from "lucide-react";
import { cn } from "@/app/utils/style/helper";
import type { WineSearchResultItemProps } from "./wine-list-select.props";

export default function WineSearchResultItem({
  wine,
  isSelected = false,
  onSelect,
  className,
}: WineSearchResultItemProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={cn(
        "flex h-[70px] w-full items-center gap-3 bg-white px-3 text-left transition-colors hover:bg-main-light-gray-200",
        isSelected && "bg-main-purple-50 hover:bg-main-purple-50",
        className
      )}
      onClick={() => onSelect(wine)}
    >
      <span className="flex h-[47px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[#E6E9EE] text-main-gray-500">
        <Wine className="h-[17px] w-[17px]" strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-bold leading-[18px] text-text-01">
          {wine.name}
        </span>
        <span className="block truncate text-[10px] font-medium leading-[16px] text-text-02">
          {wine.regionAndType}
        </span>
        <span className="block truncate text-[10px] font-bold leading-[16px] text-primary-main">
          {wine.searchPriceLabel}
        </span>
      </span>
    </button>
  );
}
