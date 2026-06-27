import type { Metadata } from "next";
import { getWineRecommendations } from "@/app/entity/wine-recommendation/api/wine-recommendation.server";
import WineRecommendationResultPage from "@/app/feature/wine-recommendation-result/ui/WineRecommendationResultPage";

export const metadata: Metadata = {
  title: "맞춤 와인 추천 결과 | WaMaDae",
};

export const dynamic = "force-dynamic";

export default async function WineRecommendationsPage() {
  const result = await getWineRecommendations();

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-white text-text-01">
      <WineRecommendationResultPage result={result} />
    </div>
  );
}
