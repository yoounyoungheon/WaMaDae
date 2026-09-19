import { cn } from "@/app/utils/style/helper";
import type { MenuNameBadgeProps } from "./menu-category-recommendation-result.props";

/**
 * 추천 메뉴 name 선택 배지.
 * 선택 식별자는 `name`이며, 탭으로 선택을 토글한다.
 */
export default function MenuNameBadge({
  name,
  isSelected = false,
  onToggle,
  className,
}: MenuNameBadgeProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onToggle?.(name)}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[13px] font-bold backdrop-blur-xl transition-colors",
        isSelected
          ? "border-primary/55 bg-primary/[0.16] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
          : "border-white/60 bg-white/[0.12] text-ink-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:bg-white/[0.22]",
        className
      )}
    >
      {name}
    </button>
  );
}
