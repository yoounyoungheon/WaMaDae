"use client";

import { cn } from "@/app/utils/style/helper";
import ExtractedWineSection from "./ExtractedWineSection";
import NextRecommendationButton from "./NextRecommendationButton";
import WineMenuPhotoSection from "./WineMenuPhotoSection";
import { useWineListSelectController } from "../model/use-wine-list-select-controller";
import type { WineListSelectPageProps } from "./wine-list-select.props";

export default function WineListSelectPage({
  className,
}: WineListSelectPageProps) {
  const {
    previews,
    imageErrorMessage,
    isExtracting,
    hasExtractionResult,
    extractionErrorMessage,
    wines,
    sessionId,
    selectedWineIds,
    handleAddFiles,
    handleRemoveFile,
    handleAnalyze,
    handleToggleWine,
  } = useWineListSelectController();

  const isEmptyResult = hasExtractionResult && wines.length === 0;
  const hasWines = wines.length > 0;

  return (
    <>
      <main
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]",
          className
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-[680px] flex-col px-5",
            // floating CTA에 마지막 카드가 가려지지 않도록 하단 여백을 확보한다.
            hasWines ? "pb-28" : "pb-5"
          )}
        >
          <section
            className="pb-9 pt-7 text-center"
            aria-labelledby="wine-list-intro-title"
          >
            <h2
              id="wine-list-intro-title"
              className="text-[23px] font-extrabold leading-[1.36] text-ink-page"
            >
              메뉴판을 찍으면
              <br />
              와인 리스트를 읽어드려요
            </h2>
            <p className="mt-2.5 text-[13px] font-medium leading-relaxed text-ink-secondary">
              사진 속 와인을 마이쏨이 찾아드릴게요
            </p>
          </section>

          <WineMenuPhotoSection
            previews={previews}
            isAnalyzing={isExtracting}
            imageErrorMessage={imageErrorMessage}
            extractionErrorMessage={extractionErrorMessage}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            onAnalyze={handleAnalyze}
          />

          {isEmptyResult ? (
            <div
              role="status"
              className="mt-7 rounded-[16px] border border-white/55 bg-white/[0.04] px-5 py-8 text-center text-[14px] font-medium leading-relaxed text-ink-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_10px_26px_rgba(72,52,112,0.04)] backdrop-blur-2xl"
            >
              인식한 와인이 없습니다.
              <br />
              메뉴판이 선명하게 보이도록 다시 촬영해 주세요.
            </div>
          ) : null}

          {hasWines ? (
            <div className="pt-7">
              <ExtractedWineSection
                wines={wines}
                selectedWineIds={selectedWineIds}
                onToggleWine={handleToggleWine}
              />
            </div>
          ) : null}
        </div>
      </main>

      {hasWines ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-5 pb-[calc(16px_+_env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto mx-auto w-full max-w-[640px]">
            <NextRecommendationButton
              sessionId={sessionId}
              selectedWineIds={selectedWineIds}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
