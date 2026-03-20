"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import WinePhotoUpload from "../ui/WinePhotoUpload";
import WineOcrResult from "../ui/WineOcrResult";
import { type WineCardProps } from "../ui/WineCard";
import { type WineSearcherCompletedPayload } from "../ui/WineSearcher";
import { cn } from "@/app/utils/style/helper";
import Button from "@/app/shared/ui/atom/button";
import ActionErrorDialog from "@/app/shared/ui/molecule/ActionErrorDialog";
import { type APIResponseType } from "@/app/utils/http";
import { type OcrDetectedWine } from "../business/getWineListForOcr";

export interface RecommendPageProps {
  uploadButtonLabel?: string;
  analysisStatus?: boolean;
  getWineListForOcr: (
    formData: FormData,
  ) => Promise<APIResponseType<OcrDetectedWine[]>>;
}

const getCardKey = (card: WineCardProps) =>
  `${card.name}-${card.priceLabel}-${card.imageUrl}`;

const mapOcrWineToCard = (wine: OcrDetectedWine): WineCardProps => ({
  name: wine.name,
  description:
    [wine.originalName, wine.country ? `${wine.country} 와인` : null]
      .filter(Boolean)
      .join(" · ") || "OCR로 감지된 와인입니다.",
  imageUrl: "/carrot1.png",
  priceLabel: "가격 정보 없음",
});

export default function RecommendPage({
  uploadButtonLabel = "와인 추천받기",
  analysisStatus,
  getWineListForOcr,
}: RecommendPageProps) {
  const [displayCards, setDisplayCards] = useState<WineCardProps[]>([]);
  const [isAnalysisCompleted, setIsAnalysisCompleted] = useState(
    Boolean(analysisStatus),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsAnalysisCompleted(Boolean(analysisStatus));
  }, [analysisStatus]);

  const handleDirectAddCompleted = ({
    selectedWines,
  }: WineSearcherCompletedPayload) => {
    if (selectedWines.length === 0) return;

    setDisplayCards((prev) => {
      const existingKeys = new Set(prev.map((card) => getCardKey(card)));
      const nextCards = selectedWines.filter(
        (wine) => !existingKeys.has(getCardKey(wine)),
      );

      return [...prev, ...nextCards];
    });
  };

  const handleAnalyzeWinePhoto = async (file: File | null) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setIsSubmitting(true);

    try {
      const response = await getWineListForOcr(formData);

      if (response.isFailure || !response.data) {
        setErrorMessage(response.message ?? "잠시 후 다시 시도해주세요.");
        return;
      }

      setDisplayCards(response.data.map(mapOcrWineToCard));
      setIsAnalysisCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={cn("grid grid-cols-2 gap-10 h-full overflow-y-auto")}>
      <div className="col-span-2 p-3">
        <WinePhotoUpload
          buttonLabel={uploadButtonLabel}
          onButtonClick={handleAnalyzeWinePhoto}
          isSubmitting={isSubmitting}
        />
      </div>

      {isAnalysisCompleted && (
        <div className="col-span-2 p-3">
          <div className="flex flex-col gap-3">
            <WineOcrResult
              cards={displayCards}
              onSelect={() => {}}
              onDeSelect={() => {}}
              onAllSelect={() => {}}
              onAllDeSelect={() => {}}
              fetchWineSearch={async () => []} // TODO: 와인 검색 API 연동 필요
              onDirectAddCompleted={handleDirectAddCompleted}
            />
          </div>
        </div>
      )}

      {isAnalysisCompleted && (
        <div className="col-span-2 p-5 mb-3">
          <Link href="/main/" className="block w-full">
            <Button className="w-full">다음</Button>
          </Link>
        </div>
      )}

      <ActionErrorDialog
        open={Boolean(errorMessage)}
        message={errorMessage ?? undefined}
        onOpenChange={(open) => {
          if (!open) {
            setErrorMessage(null);
          }
        }}
      />
    </section>
  );
}
