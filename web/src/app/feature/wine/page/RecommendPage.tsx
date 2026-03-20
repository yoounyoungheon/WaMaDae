"use client";

import { useRouter } from "next/navigation";
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
import { type RecommendMenuCategoriesResponse } from "../business/menuCategoryRecommendation";

export interface RecommendPageProps {
  uploadButtonLabel?: string;
  analysisStatus?: boolean;
  getWineListForOcr: (
    formData: FormData,
  ) => Promise<APIResponseType<OcrDetectedWine[]>>;
  recommendMenuCategoriesFromWineList: (
    payload: {
      wines: { id?: number; name: string }[];
    },
    idempotencyKey: string,
  ) => Promise<APIResponseType<RecommendMenuCategoriesResponse>>;
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
  recommendMenuCategoriesFromWineList,
}: RecommendPageProps) {
  const router = useRouter();
  const [displayCards, setDisplayCards] = useState<WineCardProps[]>([]);
  const [selectedCards, setSelectedCards] = useState<WineCardProps[]>([]);
  const [isAnalysisCompleted, setIsAnalysisCompleted] = useState(
    Boolean(analysisStatus),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNextSubmitting, setIsNextSubmitting] = useState(false);
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

    setSelectedCards((prev) => {
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
      setSelectedCards([]);
      setIsAnalysisCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (selectedCards.length === 0) {
      setErrorMessage("추천에 사용할 와인을 하나 이상 선택해주세요.");
      return;
    }

    const idempotencyKey = crypto.randomUUID();

    setIsNextSubmitting(true);

    try {
      const response = await recommendMenuCategoriesFromWineList({
        wines: selectedCards.map((card) => ({
          ...(typeof card.id === "number" ? { id: card.id } : {}),
          name: card.name,
        })),
      }, idempotencyKey);

      if (response.isFailure || !response.data) {
        setErrorMessage(response.message ?? "잠시 후 다시 시도해주세요.");
        return;
      }

      const searchParams = new URLSearchParams();
      searchParams.set("key", response.data.recommendationId);

      selectedCards.forEach((card) => {
        searchParams.append("wine", card.name);
      });

      router.push(`/main/key-words?${searchParams.toString()}`);
    } finally {
      setIsNextSubmitting(false);
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
              onSelect={(card) => {
                setSelectedCards((prev) => [...prev, card]);
              }}
              onDeSelect={(card) => {
                setSelectedCards((prev) =>
                  prev.filter(
                    (selectedCard) => getCardKey(selectedCard) !== getCardKey(card),
                  ),
                );
              }}
              onAllSelect={(cards) => {
                setSelectedCards(cards);
              }}
              onAllDeSelect={() => {
                setSelectedCards([]);
              }}
              fetchWineSearch={async () => []} // TODO: 와인 검색 API 연동 필요
              onDirectAddCompleted={handleDirectAddCompleted}
            />
          </div>
        </div>
      )}

      {isAnalysisCompleted && (
        <div className="col-span-2 p-5 mb-3">
          <Button
            className="w-full"
            disabled={isNextSubmitting}
            onClick={() => void handleNext()}
          >
            {isNextSubmitting ? "이동 중..." : "다음"}
          </Button>
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
