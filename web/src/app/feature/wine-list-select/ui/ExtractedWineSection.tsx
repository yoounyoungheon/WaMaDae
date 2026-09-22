import { cn } from "@/app/utils/style/helper";
import ExtractedWineCard from "./ExtractedWineCard";
import type { ExtractedWineSectionProps } from "./wine-list-select.props";

const DEFAULT_TITLE = "찾은 와인";

/**
 * 추출된 세션 와인 후보 목록. 사용자가 페어링에 사용할 와인을 다중 선택한다.
 * 선택된 항목 수를 함께 표시한다.
 */
export default function ExtractedWineSection({
  wines,
  selectedWineIds,
  onToggleWine,
  title = DEFAULT_TITLE,
  className,
}: ExtractedWineSectionProps) {
  const selectedSet = new Set(selectedWineIds);

  return (
    <section className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-bold leading-none text-ink-emphasis">
          {title}
        </h2>
        {selectedSet.size > 0 ? (
          <p className="text-[13px] font-bold text-primary">
            {selectedSet.size}개 선택
          </p>
        ) : null}
      </div>
      <div className="mt-3 grid gap-2">
        {wines.map((wine) => (
          <ExtractedWineCard
            key={wine.id}
            wine={wine}
            isSelected={selectedSet.has(wine.id)}
            onToggle={onToggleWine}
          />
        ))}
      </div>
    </section>
  );
}
