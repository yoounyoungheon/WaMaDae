import type { Metadata } from "next";
import WineListSelectPage from "@/app/feature/wine-list-select/ui/WineListSelectPage";
import PageHeader from "@/app/shared/ui/molecule/page-header";

export const metadata: Metadata = {
  title: "와인 리스트 만들기 | WaMaDae",
};

export default function WineAiPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background-03 text-text-01">
      <PageHeader title="와인 리스트 선택" routeBackPath="/" />
      <WineListSelectPage />
    </div>
  );
}
