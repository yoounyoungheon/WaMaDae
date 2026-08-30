import { ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/app/shared/ui/atom/button";
import { cn } from "@/app/utils/style/helper";
import PhotoUploadBox from "./PhotoUploadBox";
import type { WineMenuPhotoSectionProps } from "./wine-list-select.props";
import { WINE_MENU_IMAGE_ACCEPT } from "@/app/entity/wine/model/wine-menu-image";

export default function WineMenuPhotoSection({
  isOpen,
  image,
  isAnalyzing = false,
  errorMessage,
  onOpenChange,
  onImageChange,
  onAnalyze,
  className,
}: WineMenuPhotoSectionProps) {
  const isUnavailable = !image || isAnalyzing;

  return (
    <section className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        <h2 className="sr-only">
          사진으로 와인 리스트 찾기
        </h2>
        <button
          type="button"
          aria-expanded={isOpen}
          className="ml-auto flex min-h-9 items-center gap-1 px-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink-emphasis"
          onClick={() => onOpenChange(!isOpen)}
        >
          {isOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          {isOpen ? "접어둘래요" : "사진으로 찾기"}
        </button>
      </div>

      {isOpen ? (
        <>
          <PhotoUploadBox
            image={image}
            accept={WINE_MENU_IMAGE_ACCEPT}
            disabled={isAnalyzing}
            isLoading={isAnalyzing}
            className="mt-1"
            onFileChange={onImageChange}
          />

          <Button
            htmlType="button"
            variant="outline"
            type="primary"
            size="default"
            radius="lg"
            disabled={isUnavailable}
            aria-busy={isAnalyzing}
            className={cn(
              "mt-3 h-[48px] w-full rounded-[18px] border border-white/55 bg-white/[0.04] px-4 py-3 text-[14px] font-bold text-ink-emphasis shadow-[inset_0_1px_0_rgba(255,255,255,0.82),inset_0_-1px_0_rgba(110,58,245,0.06),0_14px_34px_rgba(72,52,112,0.045)] backdrop-blur-2xl backdrop-saturate-150 hover:bg-white/[0.09] disabled:!opacity-100",
              isUnavailable &&
                "!border-white/45 !bg-white/[0.02] !text-ink-muted !shadow-[inset_0_1px_0_rgba(255,255,255,0.68),inset_0_-1px_0_rgba(110,58,245,0.04),0_10px_28px_rgba(72,52,112,0.025)] hover:!bg-white/[0.02]",
              isAnalyzing && "cursor-wait"
            )}
            onClick={onAnalyze}
          >
            {isAnalyzing ? "분석 중" : "와인 리스트 분석"}
          </Button>

          {errorMessage ? (
            <p
              role="alert"
              className="mt-2 text-[11px] font-medium text-error-main"
            >
              {errorMessage}
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
