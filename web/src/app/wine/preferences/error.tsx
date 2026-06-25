"use client";

import Button from "@/app/shared/ui/atom/button";

export default function WinePreferenceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-background-03 px-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-[18px] font-bold text-text-01">
          추천 선택지를 불러오지 못했어요
        </h1>
        <p className="text-[13px] font-medium text-text-03">
          서버 상태를 확인한 뒤 다시 시도해주세요.
        </p>
      </div>
      <Button
        htmlType="button"
        variant="outline"
        type="primary"
        radius="lg"
        className="px-5 py-2 text-[13px] font-bold"
        onClick={reset}
      >
        다시 시도
      </Button>
    </main>
  );
}
