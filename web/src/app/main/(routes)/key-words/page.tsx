import KeywordCardSelector from "@/app/feature/wine/ui/KeywordCardSelector";
import { getMenuCategoryRecommendation } from "@/app/feature/wine/business/menuCategoryRecommendation";

export const maxDuration = 60;

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const key =
    typeof searchParams.key === "string"
      ? searchParams.key
      : Array.isArray(searchParams.key)
        ? searchParams.key[0]
        : undefined;

  if (!key) {
    return <></>;
  }

  const response = await getMenuCategoryRecommendation(key);

  if (response.isFailure || !response.data) {
    return (
      <section className="p-4 text-sm text-slate-600">
        {response.message ?? "키워드를 불러오지 못했습니다."}
      </section>
    );
  }

  if (response.data.status !== "SUCCEEDED" || !response.data.result) {
    return (
      <section className="p-4 text-sm text-slate-600">
        키워드 추천을 준비하고 있습니다.
      </section>
    );
  }

  const wines =
    typeof searchParams.wine === "string"
      ? [searchParams.wine]
      : Array.isArray(searchParams.wine)
        ? searchParams.wine
        : [];

  return (
    <section className="p-4">
      <KeywordCardSelector
        keywords={response.data.result.categories}
        wines={wines}
      />
    </section>
  );
}
