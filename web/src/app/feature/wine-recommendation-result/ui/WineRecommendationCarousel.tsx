"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/app/utils/style/helper";
import WineRecommendationCard from "./WineRecommendationCard";
import type { WineRecommendationCarouselProps } from "./wine-recommendation-result.props";

export default function WineRecommendationCarousel({
  wines,
  currentIndex,
  onPrevious,
  onNext,
  className,
}: WineRecommendationCarouselProps) {
  const currentWine = wines[currentIndex];

  if (!currentWine) {
    return (
      <section
        className={cn(
          "flex h-[214px] items-center justify-center rounded-xl border border-main-light-gray-600 bg-white text-[13px] font-semibold text-text-03",
          className
        )}
      >
        추천 와인이 없습니다.
      </section>
    );
  }

  return (
    <section className={cn("relative", className)} aria-label="추천 와인">
      <WineRecommendationCard wine={currentWine} />

      {wines.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="이전 추천 와인 보기"
            className="absolute left-[-14px] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-text-03 shadow-md ring-1 ring-black/5"
            onClick={onPrevious}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="다음 추천 와인 보기"
            className="absolute right-[-14px] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-text-03 shadow-md ring-1 ring-black/5"
            onClick={onNext}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </>
      ) : null}

      <div
        className="mt-4 flex items-center justify-center gap-1.5"
        aria-label={`${currentIndex + 1}번째 추천 와인`}
      >
        {wines.map((wine, index) => (
          <span
            key={wine.id}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === currentIndex
                ? "w-4 bg-primary-main"
                : "w-1.5 bg-main-light-gray-600"
            )}
            aria-hidden
          />
        ))}
      </div>
    </section>
  );
}
