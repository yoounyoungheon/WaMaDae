"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type { WinePreferenceOptions } from "@/app/entity/wine-preference/model/wine-preference.type";
import Button from "@/app/shared/ui/atom/button";
import { useWinePreferenceSelectController } from "../model/use-wine-preference-select-controller";

interface WinePreferenceBottomActionProps {
  options: WinePreferenceOptions;
}

export default function WinePreferenceBottomAction({
  options,
}: WinePreferenceBottomActionProps) {
  const router = useRouter();
  const { isCompleteEnabled } = useWinePreferenceSelectController(options);

  return (
    <div className="shrink-0 border-t border-main-light-gray-600 bg-white px-[22px] pb-[calc(0.875rem+env(safe-area-inset-bottom))] pt-3">
      <Button
        htmlType="button"
        variant="solid"
        type="primary"
          radius="lg"
          disabled={!isCompleteEnabled}
          className="h-12 w-full gap-2 text-[14px] font-bold"
          onClick={() => router.push("/wine/recommendations")}
        >
        <Sparkles className="h-4 w-4" strokeWidth={2.2} aria-hidden />
        와인 추천받기
      </Button>
    </div>
  );
}
