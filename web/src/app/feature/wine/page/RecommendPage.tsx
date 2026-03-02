"use client";

import WinePhotoUpload from "../ui/WinePhotoUpload";
import WineOcrResult from "../ui/WineOcrResult";
import { type WineCardProps } from "../ui/WineCard";
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

export default function RecommendPage({
  cards = defaultCards,
  uploadButtonLabel = "와인 추천받기",
  analysisStatus,
  className,
}: RecommendPageProps) {
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
              cards={cards}
              onSelect={() => {}}
              onDeSelect={() => {}}
              onAllSelect={() => {}}
              onAllDeSelect={() => {}}
            />
          </div>
        </div>
      )}

      {analysisStatus && (
        <div className="col-span-2 p-5 mb-3">
          <Button className="w-full">다음</Button>
        </div>
      )}
    </section>
  );
}
