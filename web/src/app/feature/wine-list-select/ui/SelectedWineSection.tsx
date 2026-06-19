import { cn } from "@/app/utils/style/helper";
import SelectedWineCard from "./SelectedWineCard";
import type { SelectedWineSectionProps } from "./wine-list-select.props";

const DEFAULT_TITLE = "WINES";

export default function SelectedWineSection({
  wines,
  title = DEFAULT_TITLE,
  onRemoveWine,
  className,
}: SelectedWineSectionProps) {
  return (
    <section className={cn("w-full", className)}>
      <h2 className="text-[17px] font-extrabold uppercase leading-none text-text-01">
        {title}
      </h2>
      <div className="mt-6 grid gap-4">
        {wines.map((wine) => (
          <SelectedWineCard key={wine.id} wine={wine} onRemove={onRemoveWine} />
        ))}
      </div>
    </section>
  );
}
