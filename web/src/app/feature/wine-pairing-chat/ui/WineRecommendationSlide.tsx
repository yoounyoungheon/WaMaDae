"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Wine } from "lucide-react";
import { cn } from "@/app/utils/style/helper";
import type { PairingStreamWine } from "@/app/entity/wine-pairing/model/wine-pairing.type";
import type { WineRecommendationSlideProps } from "./wine-pairing-chat.props";

const CARD_HEIGHT = "h-[330px]";

type TooltipField = "comment" | "reason";

export default function WineRecommendationSlide({
  slide,
  className,
}: WineRecommendationSlideProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipField | null>(null);
  const canFlip = slide.isCommitted && slide.wine !== null;

  function handleFlip() {
    setTooltip(null);
    setIsFlipped(true);
  }

  return (
    <article className={cn("relative w-full", className)}>
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

      <div className="[perspective:1000px]">
        <div
          className={cn(
            "relative transition-transform duration-500 [transform-style:preserve-3d]",
            isFlipped && "[transform:rotateY(180deg)]"
          )}
        >
          {/* 앞면 */}
          <div className="pt-7 [backface-visibility:hidden]">
            <div
              className={cn(
                "relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#d9a3ff] to-[#a65bef] px-5 pb-6 pt-10 shadow-xs",
                CARD_HEIGHT
              )}
            >
              {slide.rank ? (
                <span className="inline-flex shrink-0 w-fit items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold leading-none text-primary-main">
                  {slide.rank}순위
                </span>
              ) : null}
              {canFlip ? (
                <button
                  type="button"
                  onClick={handleFlip}
                  className="absolute right-3 top-3 rounded-lg bg-white/20 px-2.5 py-1 text-[11px] font-medium text-white"
                >
                  와인 상세
                </button>
              ) : null}

              <h3 className="mt-3 line-clamp-2 shrink-0 break-words text-[19px] font-extrabold leading-snug text-white">
                {slide.name}
              </h3>

              <p className="mt-4 shrink-0 text-[11px] font-semibold leading-none text-white/70">
                와마대 한줄평
              </p>
              <p
                className={cn(
                  "mt-1.5 line-clamp-2 shrink-0 break-words text-[14px] font-bold leading-snug text-white",
                  slide.comment && "cursor-pointer"
                )}
                onClick={() => slide.comment && setTooltip("comment")}
              >
                {slide.comment}
              </p>

              <p className="mt-4 shrink-0 text-[11px] font-semibold leading-none text-white/70">
                추천 이유
              </p>
              <p
                className={cn(
                  "mt-1.5 line-clamp-3 break-words text-[13px] leading-relaxed text-white/90",
                  slide.reason && "cursor-pointer"
                )}
                onClick={() => slide.reason && setTooltip("reason")}
              >
                {slide.reason}
              </p>

              {/* 반투명 툴팁 오버레이 */}
              {tooltip ? (
                <div
                  className="absolute inset-0 z-20 flex cursor-pointer flex-col justify-center rounded-2xl bg-black/70 px-5 py-6"
                  onClick={() => setTooltip(null)}
                >
                  <p className="shrink-0 text-[11px] font-semibold text-white/70">
                    {tooltip === "comment" ? "와마대 한줄평" : "추천 이유"}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-white">
                    {tooltip === "comment" ? slide.comment : slide.reason}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* 뒷면 */}
          <div className="absolute inset-0 pt-7 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {slide.wine ? (
              <WineDetailBack
                wine={slide.wine}
                height={CARD_HEIGHT}
                onBack={() => setIsFlipped(false)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function WineDetailBack({
  wine,
  height,
  onBack,
}: {
  wine: PairingStreamWine;
  height: string;
  onBack: () => void;
}) {
  const displayName = wine.koreanName ?? wine.name;
  const subtitle = [wine.category, wine.country].filter(Boolean).join(" · ");

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl bg-white px-5 pb-5 pt-8 shadow-xs",
        height
      )}
    >
      <button
        type="button"
        onClick={onBack}
        className="absolute right-3 top-3 rounded-lg bg-primary-main/10 px-2.5 py-1 text-[11px] font-medium text-primary-main"
      >
        돌아가기
      </button>

      {/* 와인명 + subtitle */}
      <div className="mt-3 shrink-0">
        <p className="line-clamp-2 text-[19px] font-extrabold leading-snug text-primary-main">
          {displayName}
        </p>
        {subtitle ? (
          <p className="mt-0.5 text-[12px] italic text-main-gray-400">{subtitle}</p>
        ) : null}
      </div>

      <hr className="mt-3 shrink-0 border-main-gray-100" />

      {/* 메타 데이터 */}
      <div className="mt-4 flex shrink-0 flex-col gap-1.5 text-[11px]">
        {wine.grape ? <MetaRow label="품종" value={wine.grape} /> : null}
        {wine.vintage ? <MetaRow label="빈티지" value={String(wine.vintage)} /> : null}
        {wine.alcohol != null ? (
          <MetaRow label="도수" value={`${wine.alcohol}%`} />
        ) : null}
        {wine.region ? <MetaRow label="지역" value={wine.region} /> : null}
        {wine.rating ? <MetaRow label="평점" value={`★ ${wine.rating}`} /> : null}
      </div>

      {wine.body != null ||
      wine.sweetness != null ||
      wine.tannin != null ||
      wine.acidity != null ? (
        <div className="mt-8 flex shrink-0 gap-2">
          {wine.body != null ? (
            <VerticalGauge label="바디" value={wine.body} />
          ) : null}
          {wine.sweetness != null ? (
            <VerticalGauge label="당도" value={wine.sweetness} />
          ) : null}
          {wine.tannin != null ? (
            <VerticalGauge label="타닌" value={wine.tannin} />
          ) : null}
          {wine.acidity != null ? (
            <VerticalGauge label="산도" value={wine.acidity} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-12 shrink-0 text-main-gray-400">{label}</span>
      <span className="font-bold text-main-gray-700">{value}</span>
    </div>
  );
}

const GAUGE_W = 28;
const GAUGE_H = 60;
const GAUGE_R = 7; // 위쪽만 rounded-xl 수준

/** 위쪽 두 모서리만 둥근 사각형 SVG path */
function topRoundedPath(y: number, h: number, r: number): string {
  const cr = Math.min(r, h / 2, GAUGE_W / 2);
  return [
    `M 0 ${y + h}`,
    `L 0 ${y + cr}`,
    `A ${cr} ${cr} 0 0 1 ${cr} ${y}`,
    `L ${GAUGE_W - cr} ${y}`,
    `A ${cr} ${cr} 0 0 1 ${GAUGE_W} ${y + cr}`,
    `L ${GAUGE_W} ${y + h}`,
    `Z`,
  ].join(" ");
}

function VerticalGauge({ label, value }: { label: string; value: number }) {
  const uid = useId();
  const gradId = `gf-${uid}`;
  const rounded = Math.round(value);
  const fillH = GAUGE_H * Math.min(1, Math.max(0, rounded / 5));
  const fillY = GAUGE_H - fillH;

  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <svg
        width={GAUGE_W}
        height={GAUGE_H}
        viewBox={`0 0 ${GAUGE_W} ${GAUGE_H}`}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D6B4F8" />
            <stop offset="100%" stopColor="#A65BEF" />
          </linearGradient>
        </defs>
        {/* 트랙: 위쪽만 둥근 사각형 */}
        <path d={topRoundedPath(0, GAUGE_H, GAUGE_R)} fill="#f6effd" />
        {/* 채움: 위쪽만 둥근 사각형, 바닥은 flat */}
        {fillH > 0 && (
          <path d={topRoundedPath(fillY, fillH, GAUGE_R)} fill={`url(#${gradId})`} />
        )}
      </svg>
      <span className="text-[11px] font-bold text-primary-main">{rounded}</span>
      <span className="text-[11px] text-main-gray-400">{label}</span>
    </div>
  );
}
