import ReommendPage from "@/app/feature/wine/page/RecommendPage";
import { getWineListForOcr } from "@/app/feature/wine/business/getWineListForOcr";
import { recommendMenuCategoriesFromWineList } from "@/app/feature/wine/business/menuCategoryRecommendation";

export const maxDuration = 60;

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
      recommendMenuCategoriesFromWineList={recommendMenuCategoriesFromWineList}
    />
  );
}
