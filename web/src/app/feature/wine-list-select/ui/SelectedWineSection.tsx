import { cn } from "@/app/utils/style/helper";
import SelectedWineCard from "./SelectedWineCard";
import type { SelectedWineSectionProps } from "./wine-list-select.props";

const DEFAULT_TITLE = "담은 와인";

export default function SelectedWineSection({
  wines,
  title = DEFAULT_TITLE,
  onRemoveWine,
  className,
}: SelectedWineSectionProps) {
  return (
    <section className={cn("w-full", className)}>
      <h2 className="text-[16px] font-bold leading-none text-ink-emphasis">
        {title}
      </h2>
      <div className="mt-3 max-h-[272px] overflow-y-auto pr-1">
        <div className="grid gap-2">
          {wines.map((wine) => (
            <SelectedWineCard
              key={wine.id}
              wine={wine}
              onRemove={onRemoveWine}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
