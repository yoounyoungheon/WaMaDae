import Image from "next/image";
import { Check } from "lucide-react";
import { Card } from "@/app/shared/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";
import type { DefaultMenuCategoryCardProps } from "./menu-category-recommendation-result.props";

/** 서버 추천 결과가 아닌 아이콘형 기본 메뉴 카테고리 한 건. */
export default function DefaultMenuCategoryCard({
  category,
  isSelected = false,
  onToggle,
  className,
}: DefaultMenuCategoryCardProps) {
  return (
    <label
      className={cn(
        "group block cursor-pointer rounded-[16px]",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
        className
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={isSelected}
        onChange={() => onToggle?.(category.name)}
        readOnly={!onToggle}
      />

      <Card
        className={cn(
          "relative flex aspect-[1/1.08] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[16px] border px-2 py-3 text-center backdrop-blur-2xl backdrop-saturate-150 transition-colors",
          isSelected
            ? "border-primary/55 bg-primary/[0.10] text-ink-emphasis shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_26px_rgba(110,58,245,0.10)]"
            : "border-white/55 bg-white/[0.04] text-ink-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_10px_24px_rgba(72,52,112,0.04)] hover:border-white/75 hover:bg-white/[0.10]"
        )}
      >
        <Image
          src={category.iconPath}
          alt=""
          aria-hidden
          width={38}
          height={38}
          className="h-[38px] w-[38px]"
        />

        <span className="line-clamp-2 break-words text-[13px] font-bold leading-tight">
          {category.name}
        </span>

        {isSelected ? (
          <span
            aria-hidden
            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border border-white/70 bg-primary text-white shadow-[0_4px_10px_rgba(110,58,245,0.22)]"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : null}
      </Card>
    </label>
  );
}
