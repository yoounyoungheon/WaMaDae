import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/app/utils/style/helper";
import type { TableKeywordCardProps } from "./table-keyword-select.props";

/**
 * 테이블 키워드 선택 카드.
 * 공용 Card에 의존하지 않고 자체 `label` root로 구성한다.
 * 숨겨진 native checkbox가 선택 semantics와 접근 가능한 이름(키워드 name)을 제공하고,
 * 선택/포커스 표현은 `has-[:checked]`, `has-[:focus-visible]`로 연결한다.
 */
export default function TableKeywordCard({
  keyword,
  isSelected,
  onToggle,
  className,
}: TableKeywordCardProps) {
  return (
    <label
      className={cn(
        "group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2",
        "rounded-2xl border border-main-light-gray-600 bg-white shadow-sm transition-colors",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-main",
        "has-[:checked]:border-transparent has-[:checked]:bg-gradient-to-br has-[:checked]:from-main-purple-400 has-[:checked]:to-primary-main has-[:checked]:shadow-md",
        className
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={isSelected}
        onChange={() => onToggle(keyword.id)}
      />

      <Image
        src={keyword.emojiPath}
        alt=""
        aria-hidden
        width={40}
        height={40}
        className="h-10 w-10"
      />

      <span className="line-clamp-2 px-1 text-center text-[13px] font-bold leading-tight text-text-02 group-has-[:checked]:text-white">
        {keyword.name}
      </span>

      <span
        aria-hidden
        className="absolute right-2 top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-white text-primary-main shadow-sm group-has-[:checked]:flex"
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    </label>
  );
}
