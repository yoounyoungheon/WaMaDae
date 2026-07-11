"use client";

import { cn } from "@/app/utils/style/helper";
import NextRecommendationButton from "./NextRecommendationButton";
import SelectedWineSection from "./SelectedWineSection";
import WineMenuPhotoSection from "./WineMenuPhotoSection";
import WineSearchSection from "./WineSearchSection";
import { useWineListSelectController } from "../model/use-wine-list-select-controller";
import type { WineListSelectPageProps } from "./wine-list-select.props";

export default function WineListSelectPage({
  className,
}: WineListSelectPageProps) {
  const {
    isPhotoSectionOpen,
    setIsPhotoSectionOpen,
    menuImagePreview,
    query,
    setQuery,
    searchResults,
    selectedWineIds,
    selectedWines,
    isSearching,
    searchErrorMessage,
    isAnalyzing,
    analysisErrorMessage,
    handleImageChange,
    handleAnalyze,
    handleSelectWine,
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
        <div className="flex flex-col pb-6">
          <div className="px-[23px] pt-7">
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

          <div className="px-[23px] pt-[18px]">
            <WineSearchSection
              query={query}
              results={searchResults}
              selectedWineIds={selectedWineIds}
              isLoading={isSearching}
              errorMessage={searchErrorMessage}
              onQueryChange={setQuery}
              onSelectWine={handleSelectWine}
            />
          </div>

          {selectedWineIds.length > 0 ? (
            <div className="px-[23px] pt-8">
              <SelectedWineSection
                wines={selectedWines}
                onRemoveWine={handleRemoveWine}
              />
            </div>
          ) : null}
        </div>
      </main>

      {selectedWineIds.length > 0 ? (
        <div className="shrink-0 border-t border-main-light-gray-600 bg-white px-6 pb-3.5 pt-3 shadow-[0_-4px_16px_rgba(26,26,26,0.08)]">
          <NextRecommendationButton
            wines={selectedWines}
            hasMissingWineData={selectedWines.length < selectedWineIds.length}
          />
        </div>
      ) : null}
    </>
  );
}
