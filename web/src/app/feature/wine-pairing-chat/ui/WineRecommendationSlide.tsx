"use client";

import { useState } from "react";
import Image from "next/image";
import { Wine } from "lucide-react";
import type {
  PairingStreamWine,
  PairingStreamWinePrice,
} from "@/app/entity/wine-pairing/model/wine-pairing.type";
import { Card } from "@/app/shared/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";
import type { WineRecommendationSlideProps } from "./wine-pairing-chat.props";

const CARD_HEIGHT = "h-[388px]";
type ExpandedField = "comment" | "reason";

export default function WineRecommendationSlide({
  slide,
  className,
}: WineRecommendationSlideProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [expandedField, setExpandedField] = useState<ExpandedField | null>(null);
  const canFlip = slide.isCommitted && slide.wine !== null;

  const handleFlip = () => {
    setExpandedField(null);
    setIsFlipped(true);
  };

  return (
    <article className={cn("relative w-full", className)}>
      <div className="[perspective:1200px]">
        <div
          className={cn(
            "relative transition-transform duration-500 motion-reduce:transition-none [transform-style:preserve-3d]",
            isFlipped && "[transform:rotateY(180deg)]"
          )}
        >
          <div
            aria-hidden={isFlipped}
            className="[backface-visibility:hidden]"
          >
            <RecommendationFront
              slide={slide}
              canFlip={canFlip}
              onFlip={handleFlip}
              expandedField={expandedField}
              onExpandField={setExpandedField}
              onDismissExpandedField={() => setExpandedField(null)}
              isActive={!isFlipped}
            />
          </div>

          <div
            aria-hidden={!isFlipped}
            className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          >
            {slide.wine ? (
              <WineDetailBack
                wine={slide.wine}
                onBack={() => setIsFlipped(false)}
                isActive={isFlipped}
              />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function RecommendationFront({
  slide,
  canFlip,
  onFlip,
  expandedField,
  onExpandField,
  onDismissExpandedField,
  isActive,
}: {
  slide: WineRecommendationSlideProps["slide"];
  canFlip: boolean;
  onFlip: () => void;
  expandedField: ExpandedField | null;
  onExpandField: (field: ExpandedField) => void;
  onDismissExpandedField: () => void;
  isActive: boolean;
}) {
  const subtitle = slide.wine
    ? [slide.wine.country, slide.wine.region].filter(Boolean).join(" · ")
    : "";

  return (
    <Card
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[18px] border border-white/80 bg-white/52 p-5 text-ink-page shadow-[0_18px_44px_rgba(72,52,112,0.08)] backdrop-blur-sm",
        CARD_HEIGHT
      )}
    >
      {canFlip ? (
        <button
          type="button"
          onClick={onFlip}
          tabIndex={isActive ? 0 : -1}
          aria-label={`${slide.name} 상세 정보 보기`}
          className="absolute right-3 top-3 z-10 rounded-[9px] border border-white/60 bg-primary/[0.10] px-2.5 py-1.5 text-[11px] font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl transition-colors hover:bg-primary/[0.16]"
        >
          와인 상세
        </button>
      ) : null}

      <div className="flex min-h-[126px] items-start gap-4">
        <div className="relative flex aspect-[3/7] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-white/70 text-primary">
          {slide.imageUrl ? (
            <Image
              src={slide.imageUrl}
              alt={slide.name || "추천 와인"}
              fill
              unoptimized
              sizes="54px"
              className="object-cover"
            />
          ) : (
            <Wine className="h-9 w-9" strokeWidth={1.7} aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1 pr-14 pt-1">
          {slide.rank ? (
            <p className="text-[12px] font-bold text-primary">
              {slide.rank}순위
            </p>
          ) : null}
          <h3 className="mt-2 line-clamp-3 break-words text-[20px] font-extrabold leading-[1.28] text-ink-card">
            {slide.name || "추천 와인을 찾고 있어요"}
          </h3>
          {subtitle ? (
            <p className="mt-1 line-clamp-1 text-[12px] font-medium text-ink-muted">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1 space-y-4 overflow-hidden">
        <div>
          <p className="text-[12px] font-bold text-ink-secondary">한줄평</p>
          <button
            type="button"
            disabled={!slide.comment}
            tabIndex={isActive ? 0 : -1}
            aria-label="한줄평 전체 보기"
            onClick={() => slide.comment && onExpandField("comment")}
            className={cn(
              "mt-1.5 block w-full text-left text-[14px] font-medium leading-relaxed text-ink-page disabled:cursor-default",
              slide.comment && "line-clamp-2 cursor-pointer"
            )}
          >
            {slide.comment || "추천 설명을 준비하고 있어요."}
          </button>
        </div>
        <div>
          <p className="text-[12px] font-bold text-ink-secondary">추천 이유</p>
          <button
            type="button"
            disabled={!slide.reason}
            tabIndex={isActive ? 0 : -1}
            aria-label="추천 이유 전체 보기"
            onClick={() => slide.reason && onExpandField("reason")}
            className={cn(
              "mt-1.5 block w-full text-left text-[13px] leading-relaxed text-ink-secondary disabled:cursor-default",
              slide.reason && "line-clamp-4 cursor-pointer"
            )}
          >
            {slide.reason || "메뉴와의 궁합을 분석하고 있어요."}
          </button>
        </div>
      </div>

      {expandedField ? (
        <button
          type="button"
          tabIndex={isActive ? 0 : -1}
          aria-label="상세 설명 닫기"
          onClick={onDismissExpandedField}
          className="absolute inset-0 z-20 flex cursor-pointer flex-col justify-center rounded-[18px] bg-ink-page/90 px-6 py-7 text-left backdrop-blur-xl"
        >
          <span className="text-[12px] font-bold text-white/65">
            {expandedField === "comment" ? "한줄평" : "추천 이유"}
          </span>
          <span className="mt-3 max-h-[280px] overflow-y-auto break-words text-[14px] leading-relaxed text-white">
            {expandedField === "comment" ? slide.comment : slide.reason}
          </span>
        </button>
      ) : null}
    </Card>
  );
}

function WineDetailBack({
  wine,
  onBack,
  isActive,
}: {
  wine: PairingStreamWine;
  onBack: () => void;
  isActive: boolean;
}) {
  const subtitle = [wine.country, wine.region].filter(Boolean).join(" · ");
  const priceLabel = formatPriceLabel(wine.price);
  const alcoholLabel = formatAlcoholLabel(wine.alcohol);
  const detailItems = [
    wine.vintage != null ? { label: "빈티지", value: String(wine.vintage) } : null,
    alcoholLabel ? { label: "도수", value: alcoholLabel } : null,
    priceLabel ? { label: "가격", value: priceLabel } : null,
  ].filter((item): item is { label: string; value: string } => item !== null);

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden rounded-[18px] border border-white/80 bg-white/58 p-5 text-ink-page shadow-[0_18px_44px_rgba(72,52,112,0.08)] backdrop-blur-sm",
        CARD_HEIGHT
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 pr-14">
          <p className="line-clamp-3 break-words text-[21px] font-extrabold leading-tight text-ink-card">
            {wine.wineName}
          </p>
          {subtitle ? (
            <p className="mt-2 text-[13px] font-medium text-ink-secondary">
              {subtitle}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onBack}
          tabIndex={isActive ? 0 : -1}
          aria-label={`${wine.wineName} 추천 설명으로 돌아가기`}
          className="absolute right-3 top-3 z-10 rounded-[9px] border border-white/60 bg-primary/[0.10] px-2.5 py-1.5 text-[11px] font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl transition-colors hover:bg-primary/[0.16] hover:text-ink-emphasis"
        >
          돌아가기
        </button>
      </div>

      <div className="mt-7">
        <p className="text-[12px] font-bold text-ink-secondary">와인 정보</p>
        {detailItems.length > 0 ? (
          <dl className="mt-3 grid grid-cols-2 gap-2.5">
            {detailItems.map((item) => (
              <div
                key={item.label}
                className="min-w-0 rounded-[14px] border border-white/60 bg-primary/[0.10] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl"
              >
                <dt className="text-[11px] font-medium text-ink-muted">
                  {item.label}
                </dt>
                <dd className="mt-1 break-keep text-[13px] font-bold leading-snug text-ink-emphasis">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-[14px] text-ink-muted">
            제공된 상세 정보가 없어요.
          </p>
        )}
      </div>

    </Card>
  );
}

function formatPriceLabel(price: PairingStreamWinePrice[] | null): string | null {
  const firstPrice = price?.find((item) => String(item.amount).trim().length > 0);
  if (!firstPrice) return null;

  const amountLabel =
    typeof firstPrice.amount === "number"
      ? firstPrice.amount.toLocaleString(
          firstPrice.currency === "KRW" ? "ko-KR" : "en-US"
        )
      : firstPrice.amount.trim();

  return firstPrice.currency === "KRW"
    ? `${amountLabel}${firstPrice.koreanUnit || "원"}`
    : `${firstPrice.currencySign || firstPrice.currency}${amountLabel}`;
}

function formatAlcoholLabel(alcohol: PairingStreamWine["alcohol"]): string | null {
  if (alcohol == null) return null;

  const label =
    typeof alcohol === "number" ? alcohol.toLocaleString("ko-KR") : alcohol.trim();
  if (!label) return null;

  return label.endsWith("%") ? label : `${label}%`;
}
