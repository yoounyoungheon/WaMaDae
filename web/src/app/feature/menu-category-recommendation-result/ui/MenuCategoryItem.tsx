import { Check } from "lucide-react";
import { cn } from "@/app/utils/style/helper";
import type { MenuCategoryItemProps } from "./menu-category-recommendation-result.props";

/**
 * 추천된 메뉴 카테고리 한 건.
 * 긴 문자열도 잘리지 않게 줄바꿈을 허용한다.
 */
export default function MenuCategoryItem({
  category,
  isSelected = false,
  onToggle,
  className,
}: MenuCategoryItemProps) {
  return (
    <li className={cn("list-none", className)}>
      <label
        className={cn(
          "group flex min-h-[48px] cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-[15px] font-medium leading-snug transition-colors",
          "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-main",
          isSelected
            ? "border-[#d9a3ff] bg-[#fcf6ff] text-primary-main"
            : "border-main-light-gray-600 bg-white text-text-01"
        )}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={isSelected}
          onChange={() => onToggle?.(category)}
          readOnly={!onToggle}
        />
        <span className="break-words">{category}</span>
        {isSelected ? (
          <span
            aria-hidden
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-main text-white"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : null}
      </label>
    </li>
  );
}
