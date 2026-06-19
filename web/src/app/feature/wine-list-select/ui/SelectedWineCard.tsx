import Image from "next/image";
import { Star, X } from "lucide-react";
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
        "relative flex min-h-[120px] w-full gap-3 rounded-xl bg-white p-3 shadow-md",
        className
      )}
    >
      <div className="relative h-[96px] w-[80px] shrink-0 overflow-hidden rounded-lg bg-main-light-gray-500">
        <Image
          src={wine.imageUrl}
          alt={wine.name}
          fill
          unoptimized
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1 py-1 pr-1">
        <div className="flex items-center gap-1">
          <StarRating rating={wine.rating} />
          <span className="ml-1 text-[11px] font-bold leading-none text-text-01">
            {wine.rating.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-2 line-clamp-2 text-[12px] font-bold leading-[17px] text-text-01">
          {wine.title}
        </h3>
        <p className="mt-2 truncate text-[10px] font-medium leading-none text-text-02">
          {wine.recommendationText}
        </p>
        <p className="mt-3 text-[13px] font-extrabold leading-none text-primary-main">
          {wine.priceLabel}
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

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-[1px]" aria-label={`별점 ${rating}`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const isFilled = index < Math.round(rating);

        return (
          <Star
            key={index}
            className={cn(
              "h-[10px] w-[10px]",
              isFilled
                ? "fill-[#F7B500] text-[#F7B500]"
                : "text-main-gray-300"
            )}
            strokeWidth={2.1}
          />
        );
      })}
    </span>
  );
}
