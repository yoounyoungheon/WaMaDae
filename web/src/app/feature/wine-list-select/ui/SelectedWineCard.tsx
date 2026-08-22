import { X } from "lucide-react";
import { cn } from "@/app/utils/style/helper";
import type { SelectedWineCardProps } from "./wine-list-select.props";

export default function SelectedWineCard({
  wine,
  onRemove,
  className,
}: SelectedWineCardProps) {
  return (
    <article
      className={cn(
        "relative flex w-full min-w-0 flex-col gap-1 rounded-xl bg-white p-3 pr-9 shadow-md",
        className
      )}
    >
      <h3 className="truncate text-[13px] font-bold leading-tight text-text-01">
        {wine.title}
      </h3>
      <p className="truncate text-[11px] font-medium leading-tight text-text-02">
        {wine.recommendationText}
      </p>

      {onRemove ? (
        <button
          type="button"
          aria-label={`${wine.name} 삭제`}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-text-03 shadow-sm transition-colors hover:text-error-main"
          onClick={() => onRemove(wine.id)}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      ) : null}
    </article>
  );
}
