import Image from "next/image";
import { Check } from "lucide-react";
import { Card } from "@/app/shared/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";
import type { DefaultMenuCategoryCardProps } from "./menu-category-recommendation-result.props";

/**
 * 서버 추천 결과가 아닌 기본 메뉴 카테고리 한 건.
 * 디자인의 테이블 키워드 카드와 같은 3열 정사각 카드 패턴을 사용한다.
 */
export default function DefaultMenuCategoryCard({
  category,
  isSelected = false,
  onToggle,
  className,
}: DefaultMenuCategoryCardProps) {
  return (
    <label
      className={cn(
        "group block cursor-pointer rounded-2xl",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-main",
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
          "relative flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border px-2 py-3 shadow-sm transition-colors",
          isSelected
            ? "border-transparent bg-gradient-to-br from-[#d59cff] to-[#b968f2] text-white shadow-md"
            : "border-[#dde0e5] bg-white text-text-02"
        )}
      >
        <Image
          src={category.iconPath}
          alt=""
          aria-hidden
          width={40}
          height={40}
          className="h-10 w-10"
        />

        <span
          className={cn(
            "line-clamp-2 max-w-full break-keep px-1 text-center text-[13px] font-bold leading-tight",
            isSelected ? "text-white" : "text-text-02"
          )}
        >
          {category.name}
        </span>

        {isSelected ? (
          <span
            aria-hidden
            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary-main shadow-sm"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : null}
      </Card>
    </label>
  );
}
