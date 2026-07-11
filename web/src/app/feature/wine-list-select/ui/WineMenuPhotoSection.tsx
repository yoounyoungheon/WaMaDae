import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
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
        <h2 className="text-[12px] font-bold text-text-02">
          사진으로 와인 찾아볼게요
        </h2>
        <button
          type="button"
          aria-expanded={isOpen}
          className="flex items-center gap-1 text-[10px] font-medium text-text-03 transition-colors hover:text-text-02"
          onClick={() => onOpenChange(!isOpen)}
        >
          {isOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          {isOpen ? "접어둘래요" : "다시 볼래요"}
        </button>
      </div>

      {isOpen ? (
        <>
          <PhotoUploadBox
            image={image}
            accept={WINE_MENU_IMAGE_ACCEPT}
            disabled={isAnalyzing}
            isLoading={isAnalyzing}
            className="mt-3"
            onFileChange={onImageChange}
          />

          <Button
            htmlType="button"
            variant="solid"
            type={isUnavailable ? "cancel" : "primary"}
            size="default"
            radius="lg"
            disabled={isUnavailable}
            aria-busy={isAnalyzing}
            className={cn(
              "mt-2 h-11 w-full gap-2 rounded-xl px-4 py-3 text-[13px] font-bold shadow-[0_8px_16px_rgba(15,23,42,0.08)]",
              isAnalyzing && "cursor-wait"
            )}
            onClick={onAnalyze}
          >
            <Sparkles
              className={cn("h-4 w-4", isAnalyzing && "animate-pulse")}
              strokeWidth={2}
            />
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
