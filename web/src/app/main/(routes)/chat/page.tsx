import ChatUI from "@/app/feature/chat/ui/ChatUI";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const keywords =
    typeof searchParams.keyword === "string"
      ? [searchParams.keyword]
      : Array.isArray(searchParams.keyword)
        ? searchParams.keyword
        : [];

  const wines =
    typeof searchParams.wine === "string"
      ? [searchParams.wine]
      : Array.isArray(searchParams.wine)
        ? searchParams.wine
        : [];

  return (
    <section className="flex h-full flex-col gap-4 p-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-lg">
        <p className="font-semibold text-slate-900">선택된 조건</p>
        <p className="mt-2">키워드: {keywords.join(", ") || "-"}</p>
        <p className="mt-1">와인: {wines.join(", ") || "-"}</p>
      </div>
      <div className="min-h-0 flex-1">
        <ChatUI />
      </div>
    </section>
  );
}
