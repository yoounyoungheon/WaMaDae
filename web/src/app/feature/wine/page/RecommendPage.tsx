"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import WinePhotoUpload from "../ui/WinePhotoUpload";
import WineOcrResult from "../ui/WineOcrResult";
import { type WineCardProps } from "../ui/WineCard";
import { type WineSearcherCompletedPayload } from "../ui/WineSearcher";
import { cn } from "@/app/utils/style/helper";
import Button from "@/app/shared/ui/atom/button";

export interface RecommendPageProps {
  cards?: WineCardProps[];
  uploadButtonLabel?: string;
  analysisStatus?: boolean;
  className?: string;
}

const defaultCards: WineCardProps[] = [
  {
    name: "Chianti Classico",
    description: "체리와 스파이스 향이 조화로운 미디엄 바디 레드 와인",
    imageUrl: "/carrot4.jpeg",
    priceLabel: "₩39,000",
  },
  {
    name: "Cloudy Bay Sauvignon Blanc",
    description:
      "시트러스와 허브 노트가 선명하고 산도가 좋은 화이트 와인으로 해산물과 잘 어울립니다.",
    imageUrl: "/carrot5.jpeg",
    priceLabel: "₩55,000",
  },
];

const searchableWineCatalog: WineCardProps[] = [
  ...defaultCards,
  {
    name: "Bordeaux Reserve",
    description: "블랙커런트와 오크 향이 균형 잡힌 풀바디 레드 와인",
    imageUrl: "/carrot6.jpeg",
    priceLabel: "₩49,000",
  },
  {
    name: "Chablis Premier Cru",
    description: "미네랄감과 산도가 뚜렷해 해산물과 잘 어울리는 샤르도네",
    imageUrl: "/carrot1.png",
    priceLabel: "₩62,000",
  },
  {
    name: "Barolo Classico",
    description: "장미 향과 타닌감이 인상적인 구조감 있는 이탈리아 레드 와인",
    imageUrl: "/carrot2.png",
    priceLabel: "₩79,000",
  },
];

const getCardKey = (card: WineCardProps) =>
  `${card.name}-${card.priceLabel}-${card.imageUrl}`;

export default function RecommendPage({
  cards = defaultCards,
  uploadButtonLabel = "와인 추천받기",
  analysisStatus,
  className,
}: RecommendPageProps) {
  const [displayCards, setDisplayCards] = useState<WineCardProps[]>(cards);

  useEffect(() => {
    setDisplayCards(cards);
  }, [cards]);

  const handleDirectAddCompleted = ({
    selectedWines,
  }: WineSearcherCompletedPayload) => {
    if (selectedWines.length === 0) return;

    setDisplayCards((prev) => {
      const existingKeys = new Set(prev.map((card) => getCardKey(card)));
      const nextCards = selectedWines.filter(
        (wine) => !existingKeys.has(getCardKey(wine))
      );

      return [...prev, ...nextCards];
    });
  };

  return (
    <section
      className={cn(
        "grid grid-cols-2 gap-10 h-full overflow-y-auto",
        className
      )}
    >
      <div className="col-span-2 p-3">
        <WinePhotoUpload buttonLabel={uploadButtonLabel} />
      </div>

      {analysisStatus && (
        <div className="col-span-2 p-3">
          <div className="flex flex-col gap-3">
            <WineOcrResult
              cards={displayCards}
              onSelect={() => {}}
              onDeSelect={() => {}}
              onAllSelect={() => {}}
              onAllDeSelect={() => {}}
              fetchWineSearch={async (query: string) => {
                await new Promise((resolve) => setTimeout(resolve, 300));

                return searchableWineCatalog.filter((wine) =>
                  `${wine.name} ${wine.description}`
                    .toLowerCase()
                    .includes(query.toLowerCase())
                );
              }}
              onDirectAddCompleted={handleDirectAddCompleted}
            />
          </div>
        </div>
      )}

      {analysisStatus && (
        <div className="col-span-2 p-5 mb-3">
          <Link href="/main/report" className="block w-full">
            <Button className="w-full">다음</Button>
          </Link>
        </div>
      )}
    </section>
  );
}
