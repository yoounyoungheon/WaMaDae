import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/app/utils/style/helper";
import type { WineRecommendationCardProps } from "./wine-recommendation-result.props";

const FALLBACK_IMAGE_URL = "/Main.png";

export default function WineRecommendationCard({
  wine,
  className,
}: WineRecommendationCardProps) {
  return (
    <article
      className={cn(
        "relative h-[214px] overflow-hidden rounded-xl bg-main-gray-900 shadow-sm",
        className
      )}
    >
      <Image
        src={FALLBACK_IMAGE_URL}
        alt=""
        fill
        sizes="(max-width: 430px) 326px, 390px"
        className="object-cover"
        priority
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />

      <div className="absolute left-3 top-3 rounded-lg bg-primary-main px-2.5 py-1 text-[11px] font-bold leading-none text-white">
        {wine.rank}순위
      </div>

      <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-[11px] font-bold leading-none text-white">
        <Star
          className="h-3.5 w-3.5 fill-[#ffd43b] text-[#ffd43b]"
          aria-hidden
        />
        {wine.rating.toFixed(1)}
      </div>

      <div className="absolute inset-x-4 bottom-4">
        <h2 className="line-clamp-1 text-[16px] font-extrabold leading-tight text-white">
          {wine.koreanName}
        </h2>
        <p className="mt-2 line-clamp-1 text-[12px] font-semibold leading-normal text-white/90">
          {wine.description}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="min-w-0 truncate text-[10px] font-semibold leading-none text-white/85">
            {wine.area} · {wine.englishName}
          </p>
          <p className="shrink-0 text-[14px] font-extrabold leading-none text-white">
            {wine.price}
          </p>
        </div>
      </div>
    </article>
  );
}
