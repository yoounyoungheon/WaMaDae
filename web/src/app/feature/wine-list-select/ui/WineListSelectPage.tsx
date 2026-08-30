"use client";

import { cn } from "@/app/utils/style/helper";
import NextRecommendationButton from "./NextRecommendationButton";
import SelectedWineSection from "./SelectedWineSection";
import WineMenuPhotoSection from "./WineMenuPhotoSection";
import { useWineListSelectController } from "../model/use-wine-list-select-controller";
import type { WineListSelectPageProps } from "./wine-list-select.props";

export default function WineListSelectPage({
  className,
}: WineListSelectPageProps) {
  const {
    isPhotoSectionOpen,
    setIsPhotoSectionOpen,
    menuImagePreview,
    selectedWineIds,
    selectedWines,
    isAnalyzing,
    analysisErrorMessage,
    handleImageChange,
    handleAnalyze,
    handleRemoveWine,
  } = useWineListSelectController();

  return (
    <>
      <main
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]",
          className
        )}
      >
        <div className="mx-auto flex w-full max-w-[680px] flex-col px-5 pb-5">
          <section className="pb-9 pt-7 text-center" aria-labelledby="wine-list-intro-title">
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

          <div>
            <WineMenuPhotoSection
              isOpen={isPhotoSectionOpen}
              image={menuImagePreview}
              isAnalyzing={isAnalyzing}
              errorMessage={analysisErrorMessage}
              onOpenChange={setIsPhotoSectionOpen}
              onImageChange={handleImageChange}
              onAnalyze={handleAnalyze}
            />
          </div>

          {selectedWineIds.length > 0 ? (
            <div className="pt-7">
              <SelectedWineSection
                wines={selectedWines}
                onRemoveWine={handleRemoveWine}
              />
            </div>
          ) : null}
        </div>
      </main>

      {selectedWineIds.length > 0 ? (
        <div className="shrink-0 border-t border-white/70 bg-canvas/90 px-5 pb-[calc(14px_+_env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(60,45,96,0.08)] backdrop-blur-md">
          <div className="mx-auto w-full max-w-[640px]">
          <NextRecommendationButton
            wines={selectedWines}
            hasMissingWineData={selectedWines.length < selectedWineIds.length}
          />
          </div>
        </div>
      ) : null}
    </>
  );
}
