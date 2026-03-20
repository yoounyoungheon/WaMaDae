import ReommendPage from "@/app/feature/wine/page/RecommendPage";
import { getWineListForOcr } from "@/app/feature/wine/business/getWineListForOcr";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const isAnalysisCompleted = searchParams.status === "analysis";

  return (
    <ReommendPage
      analysisStatus={isAnalysisCompleted}
      getWineListForOcr={getWineListForOcr}
    />
  );
}
