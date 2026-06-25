import type { Metadata } from "next";
import { getWinePreferenceOptions } from "@/app/entity/wine-preference/api/wine-preference.server";
import WinePreferenceSelectPage from "@/app/feature/wine-preference-select/ui/WinePreferenceSelectPage";

export const metadata: Metadata = {
  title: "맞춤 와인 추천 조건 선택 | WaMaDae",
};

export const dynamic = "force-dynamic";

export default async function WinePreferencePage() {
  const options = await getWinePreferenceOptions();

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background-03 text-text-01">
      <WinePreferenceSelectPage options={options} />
    </div>
  );
}
