import ReommendPage from "@/app/feature/wine/page/RecommendPage";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const isAnalysisCompleted = searchParams.status === "analysis";
  console.log("isAnalysisCompleted", searchParams.status);

  return <ReommendPage analysisStatus={isAnalysisCompleted} />;
}
