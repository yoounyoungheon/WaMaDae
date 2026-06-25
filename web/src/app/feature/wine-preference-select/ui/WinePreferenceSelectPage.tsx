import { cn } from "@/app/utils/style/helper";
import WinePreferenceBottomAction from "./WinePreferenceBottomAction";
import WinePreferenceForm from "./WinePreferenceForm";
import type { WinePreferenceSelectPageProps } from "./wine-preference-select.props";

export default function WinePreferenceSelectPage({
  options,
  className,
}: WinePreferenceSelectPageProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col bg-background-03",
        className
      )}
    >
      <main className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8 pt-7">
        <h1 className="text-[20px] font-bold leading-[1.3] text-text-01">
          맞춤 추천을 위한
          <br />
          키워드를 선택해주세요
        </h1>
        <p className="mt-1 text-[12px] font-medium leading-normal text-text-03">
          AI가 더 정확한 와인을 추천해드려요
        </p>

        <WinePreferenceForm className="mt-6" options={options} />
      </main>

      <WinePreferenceBottomAction options={options} />
    </div>
  );
}
