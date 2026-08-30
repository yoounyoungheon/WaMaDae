import Image from "next/image";
import { X } from "lucide-react";
import { getWineImageUrl } from "@/app/entity/wine/lib/wine-image";
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
        "relative flex min-h-[112px] w-full min-w-0 items-center gap-4 rounded-[16px] border border-white/70 bg-white/[0.12] p-3 pr-11 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_12px_30px_rgba(72,52,112,0.06)] backdrop-blur-2xl backdrop-saturate-150",
        className
      )}
    >
      <div className="relative h-[88px] w-[72px] shrink-0 overflow-hidden rounded-[10px] bg-canvas/45">
        <Image
          src={getWineImageUrl(wine)}
          alt=""
          fill
          sizes="72px"
          className="object-contain"
          unoptimized
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-[1.35] text-ink-card">
          {wine.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-[1.45] text-ink-secondary">
          {wine.recommendationText}
        </p>
      </div>

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
