"use client";

import { useState } from "react";
import Image from "next/image";
import { Wine } from "lucide-react";
import type { PairingStreamWine } from "@/app/entity/wine-pairing/model/wine-pairing.type";
import { cn } from "@/app/utils/style/helper";
import type { WineRecommendationSlideProps } from "./wine-pairing-chat.props";

const CARD_HEIGHT = "h-[330px]";
const PLACEHOLDER_WINE_PROFILE_METRICS = [
  { label: "바디", value: 6, max: 10 },
  { label: "당도", value: 7, max: 10 },
  { label: "타닌", value: 5, max: 10 },
  { label: "산도", value: 4, max: 10 },
] as const;

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
  const displayName = wine.wineName;
  const subtitle = [wine.country, wine.region].filter(Boolean).join(" · ");
  const priceLabel = formatPriceLabel(wine.price);
  const alcoholLabel = formatAlcoholLabel(wine.alcohol);

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

      <div className="mt-4 flex shrink-0 flex-col gap-1.5 text-[11px]">
        {priceLabel ? <MetaRow label="가격" value={priceLabel} /> : null}
        {wine.vintage != null ? (
          <MetaRow label="빈티지" value={String(wine.vintage)} />
        ) : null}
        {alcoholLabel ? <MetaRow label="도수" value={alcoholLabel} /> : null}
        {wine.country ? <MetaRow label="국가" value={wine.country} /> : null}
        {wine.region ? <MetaRow label="지역" value={wine.region} /> : null}
      </div>

      <WineProfilePreview />
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

function WineProfilePreview() {
  return (
    <div
      className="relative mt-5 min-h-0 flex-[1_1_92px] overflow-hidden rounded-xl border border-main-light-gray-600 bg-[#fbf8fd] p-1.5"
      aria-label="와인 그래프 준비 중"
    >
      <div
        aria-hidden
        className="flex h-full min-h-0 items-end justify-between gap-2 opacity-45"
      >
        {PLACEHOLDER_WINE_PROFILE_METRICS.map((metric) => (
          <div
            key={metric.label}
            className="flex h-full min-h-0 flex-1 flex-col items-center justify-end gap-1"
          >
            <div className="flex min-h-0 w-full max-w-[24px] flex-1 items-end overflow-hidden rounded-t-lg bg-main-light-gray-400/50">
              <div
                className="w-full rounded-t-lg bg-primary-main"
                style={{
                  height: `${getMetricBarHeightPercent(
                    metric.value,
                    metric.max
                  )}%`,
                }}
              />
            </div>
            <span className="shrink-0 text-[10px] font-bold leading-none text-main-gray-500">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-[1px]">
        <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-bold leading-none text-white shadow-sm">
          준비중인 기능이에요.
        </span>
      </div>
    </div>
  );
}

function getMetricBarHeightPercent(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (value / max) * 100));
}

function formatPriceLabel(price: PairingStreamWine["price"]): string | null {
  const firstPrice = price?.find((item) => String(item.amount).trim().length > 0);

  if (!firstPrice) {
    return null;
  }

  const amountLabel =
    typeof firstPrice.amount === "number"
      ? firstPrice.amount.toLocaleString(
          firstPrice.currency === "KRW" ? "ko-KR" : "en-US"
        )
      : firstPrice.amount.trim();

  if (firstPrice.currency === "KRW") {
    return `${amountLabel}${firstPrice.koreanUnit || "원"}`;
  }

  return `${firstPrice.currencySign || firstPrice.currency}${amountLabel}`;
}

function formatAlcoholLabel(alcohol: PairingStreamWine["alcohol"]): string | null {
  if (alcohol == null) {
    return null;
  }

  const label =
    typeof alcohol === "number" ? alcohol.toLocaleString("ko-KR") : alcohol.trim();

  if (label.length === 0) {
    return null;
  }

  return label.endsWith("%") ? label : `${label}%`;
}
