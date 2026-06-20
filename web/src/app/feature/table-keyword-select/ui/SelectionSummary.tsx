import { cn } from "@/app/utils/style/helper";
import type { SelectionSummaryProps } from "./table-keyword-select.props";

/**
 * 현재 선택 개수를 보라색 테두리 박스로 표시한다.
 * 선택 개수는 상위에서 계산해 전달받는다.
 */
export default function SelectionSummary({
  selectedCount,
  className,
}: SelectionSummaryProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary-disabled bg-main-purple-50 px-4 py-3",
        className
      )}
    >
      <p
        aria-live="polite"
        className="text-[13px] font-semibold text-primary-action"
      >
        {selectedCount}개 선택됨
      </p>
    </div>
  );
}
