"use client";

import Link from "next/link";
import Button from "@/app/shared/ui/atom/button";
import { cn } from "@/app/utils/style/helper";
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
    <main className={cn("min-h-0 flex-1 overflow-y-auto", className)}>
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
          <>
            <div className="px-[23px] pt-8">
              <SelectedWineSection
                wines={selectedWines}
                onRemoveWine={handleRemoveWine}
              />
            </div>
            <div className="px-6 pt-5">
              <Button
                asChild
                variant="solid"
                type="primary"
                size="default"
                radius="lg"
                className="h-11 w-full rounded-lg px-4 py-3 text-[14px] font-bold"
              >
                <Link href="/wine/keywords">다음</Link>
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
