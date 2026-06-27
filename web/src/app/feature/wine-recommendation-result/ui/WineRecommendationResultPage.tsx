import PageHeader from "@/app/shared/ui/molecule/page-header";
import { cn } from "@/app/utils/style/helper";
import WineRecommendationResultClient from "./WineRecommendationResultClient";
import type { WineRecommendationResultPageProps } from "./wine-recommendation-result.props";

export default function WineRecommendationResultPage({
  result,
  className,
}: WineRecommendationResultPageProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col bg-white text-text-01",
        className
      )}
    >
      <PageHeader
        title="마이쏨이 추천하는 와인이에요!"
        routeBackPath="/wine/preferences"
      />

      <main className="min-h-0 flex-1 overflow-y-auto px-2 pb-[88px] pt-5">
        <WineRecommendationResultClient result={result} />
      </main>
    </div>
  );
}
