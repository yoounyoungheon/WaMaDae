import { cn } from "@/app/utils/style/helper";
import TableKeywordCard from "./TableKeywordCard";
import type { TableKeywordGridProps } from "./table-keyword-select.props";

/**
 * 테이블 키워드 3열 Grid.
 * API 정렬 순서를 그대로 표현하며, 선택 상태를 자체적으로 보관하지 않는다.
 */
export default function TableKeywordGrid({
  keywords,
  selectedKeywordIds,
  onToggleKeyword,
  className,
}: TableKeywordGridProps) {
  return (
    <ul className={cn("grid grid-cols-3 gap-3", className)}>
      {keywords.map((keyword) => (
        <li key={keyword.id}>
          <TableKeywordCard
            keyword={keyword}
            isSelected={selectedKeywordIds.includes(keyword.id)}
            onToggle={onToggleKeyword}
          />
        </li>
      ))}
    </ul>
  );
}
