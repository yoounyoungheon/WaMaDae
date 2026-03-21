import ChatPageClient from "./ChatPageClient";

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

  return <ChatPageClient keywords={keywords} wines={wines} />;
}
