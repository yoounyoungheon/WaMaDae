import Image from "next/image";
import { Wine } from "lucide-react";
import { cn } from "@/app/utils/style/helper";
import type { WineRecommendationSlideProps } from "./wine-pairing-chat.props";

/**
 * 와인 추천 캐러셀 슬라이드 한 장(designs/p6.png).
 * 스트리밍 중에는 채워진 필드만 표시되어 동적으로 생성되는 것처럼 보인다.
 */
export default function WineRecommendationSlide({
  slide,
  className,
}: WineRecommendationSlideProps) {
  return (
    <article className={cn("relative w-full pt-7", className)}>
      <span className="absolute left-0 top-0 z-10 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white shadow-md">
        {slide.imageUrl ? (
          <Image
            src={slide.imageUrl}
            alt={slide.name || "추천 와인"}
            fill
            unoptimized
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <Wine aria-hidden className="h-6 w-6 text-primary-main" strokeWidth={2} />
        )}
      </span>

      <div className="flex min-h-[220px] flex-col rounded-2xl bg-gradient-to-br from-[#d9a3ff] to-[#a65bef] px-5 pb-6 pt-10 shadow-xs">
        {slide.rank ? (
          <span className="inline-flex w-fit items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold leading-none text-primary-main">
            {slide.rank}순위
          </span>
        ) : null}

        <h3 className="mt-3 min-h-[24px] break-words text-[19px] font-extrabold leading-snug text-white">
          {slide.name}
        </h3>

        <p className="mt-4 text-[11px] font-semibold leading-none text-white/70">
          와마대 한줄평
        </p>
        <p className="mt-1.5 break-words text-[14px] font-bold leading-snug text-white">
          {slide.comment}
        </p>

        <p className="mt-4 text-[11px] font-semibold leading-none text-white/70">
          추천 이유
        </p>
        <p className="mt-1.5 break-words text-[13px] leading-relaxed text-white/90">
          {slide.reason}
        </p>
      </div>
    </article>
  );
}
