import type { ReactNode } from "react";
import HomeIntroCard from "../ui/HomeIntroCard";
import WineHistorySection, {
  type WineHistoryItem,
} from "../ui/WineHistorySection";
import WineCardList from "@/app/feature/wine/ui/WineCardList";
import { type WineCardProps } from "@/app/feature/wine/ui/WineCard";
import CommunityCardList from "@/app/feature/commnunity/ui/CommunityCardList";
import { type CommnunitySummaryCardProps } from "@/app/feature/commnunity/ui/CommnunitySummaryCard";
import { cn } from "@/app/utils/style/helper";

export interface HomePageProps {
  userName?: string;
  actionHref?: string;
  actionIcon?: ReactNode;
  wineHistoryList?: WineHistoryItem[];
  wineRecommendCards?: WineCardProps[];
  communityCards?: CommnunitySummaryCardProps[];
  className?: string;
}

const defaultWineHistoryList: WineHistoryItem[] = [
  { id: 1, name: "Chianti Classico", image: "/carrot4.jpeg" },
  { id: 2, name: "Sauvignon Blanc", image: "/carrot5.jpeg" },
  { id: 3, name: "Bordeaux Reserve", image: "/carrot6.jpeg" },
];

const defaultWineRecommendCards: WineCardProps[] = [
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
  {
    name: "Bordeaux Reserve",
    description: "블랙커런트와 오크 향이 균형 잡힌 풀바디 레드 와인",
    imageUrl: "/carrot6.jpeg",
    priceLabel: "₩49,000",
  },
];

const defaultCommunityCards: CommnunitySummaryCardProps[] = [
  {
    title: "오늘의 와인 추천 모음",
    description:
      "저녁 모임에 어울리는 가벼운 레드 와인 리스트를 공유합니다. 음식 페어링도 함께 확인해보세요.",
    likeCount: 24,
    commentCount: 8,
    imageUrl: "/carrot5.jpeg",
  },
  {
    title: "입문자를 위한 화이트 와인 가이드",
    description:
      "산뜻한 산미와 과실향 중심으로 실패 확률이 낮은 화이트 와인을 정리했습니다.",
    likeCount: 38,
    commentCount: 12,
    imageUrl: "/carrot4.jpeg",
  },
];

export default function HomePage({
  userName = "와마다",
  actionHref = "/main/recommend",
  actionIcon = <span className="text-lg leading-none">+</span>,
  wineHistoryList = defaultWineHistoryList,
  wineRecommendCards = defaultWineRecommendCards,
  communityCards = defaultCommunityCards,
  className,
}: HomePageProps) {
  return (
    <section
      className={cn(
        "mx-auto grid w-full max-w-md grid-cols-4 gap-6 h-full overflow-y-auto",
        className
      )}
    >
      <div className="col-span-4">
        <HomeIntroCard
          userName={userName}
          actionHref={actionHref}
          actionIcon={actionIcon}
        />
      </div>

      <div className="col-span-4 bg-background-03 p-3">
        <div className="font-semibold mb-3">최근 검색 와인</div>
        <WineHistorySection wineList={wineHistoryList} />
      </div>

      <div className="col-span-4 p-3">
        <div className="font-semibold mb-3">오늘의 와인 추천</div>
        <WineCardList cards={wineRecommendCards} />
      </div>

      <div className="col-span-4 p-3">
        <div className="font-semibold mb-3">00님을위한 HOT한 소식</div>
        <CommunityCardList cards={communityCards} />
      </div>
    </section>
  );
}
