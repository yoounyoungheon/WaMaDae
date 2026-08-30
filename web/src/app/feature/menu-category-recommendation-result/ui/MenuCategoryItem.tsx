import { Check } from "lucide-react";
import { Card } from "@/app/shared/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";
import type { MenuCategoryItemProps } from "./menu-category-recommendation-result.props";

/** 추천된 메뉴 카테고리 한 건. 긴 이름은 행 안에서 줄바꿈한다. */
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
          "group block cursor-pointer rounded-[16px]",
          "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary"
        )}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={isSelected}
          onChange={() => onToggle?.(category)}
          readOnly={!onToggle}
        />
        <Card
          className={cn(
            "flex min-h-[64px] items-center justify-between gap-3 rounded-[16px] border px-5 py-4 text-[16px] font-bold leading-snug backdrop-blur-2xl backdrop-saturate-150 transition-colors",
            isSelected
              ? "border-primary/55 bg-primary/[0.10] text-ink-card shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_30px_rgba(110,58,245,0.10)]"
              : "border-white/55 bg-white/[0.04] text-ink-card shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_10px_26px_rgba(72,52,112,0.04)] hover:border-white/75 hover:bg-white/[0.10]"
          )}
        >
          <span className="break-words">{category}</span>
          <span
            aria-hidden
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
              isSelected
                ? "bg-primary text-white"
                : "border border-ink-muted/30 text-transparent"
            )}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        </Card>
      </label>
    </li>
  );
}
