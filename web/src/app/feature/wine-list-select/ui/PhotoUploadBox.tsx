import type { ChangeEvent } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/app/utils/style/helper";
import { WINE_MENU_IMAGE_ACCEPT } from "@/app/entity/wine/model/wine-menu-image";
import type { PhotoUploadBoxProps } from "./wine-list-select.props";

const DEFAULT_ACCEPT = WINE_MENU_IMAGE_ACCEPT;
const WINE_MENU_IMAGE_INPUT_ID = "wine-menu-image-input";

export default function PhotoUploadBox({
  image,
  accept = DEFAULT_ACCEPT,
  disabled = false,
  isLoading = false,
  onFileChange,
  className,
}: PhotoUploadBoxProps) {
  const hasPreview = Boolean(image?.previewUrl);
  const isInteractionDisabled = disabled || isLoading;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileChange(event.target.files?.[0] ?? null);
    event.currentTarget.value = "";
  };

  return (
    <div
      aria-busy={isLoading}
      className={cn("relative w-full", className)}
    >
      <input
        id={WINE_MENU_IMAGE_INPUT_ID}
        type="file"
        accept={accept}
        disabled={isInteractionDisabled}
        className="sr-only"
        onChange={handleChange}
      />
      <label
        htmlFor={isInteractionDisabled ? undefined : WINE_MENU_IMAGE_INPUT_ID}
        aria-disabled={isInteractionDisabled}
        aria-label={
          image
            ? `${image.fileName} 이미지 다시 선택`
            : "와인 메뉴판 이미지 첨부"
        }
        className={cn(
          "relative flex min-h-[174px] w-full flex-col items-center justify-center overflow-hidden rounded-[20px] border border-white/55 bg-white/[0.04] px-6 py-8 text-ink-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.82),inset_0_-1px_0_rgba(110,58,245,0.06),0_18px_42px_rgba(72,52,112,0.045)] backdrop-blur-2xl backdrop-saturate-150 transition-colors",
          isLoading
            ? "cursor-wait"
            : disabled
            ? "cursor-not-allowed bg-main-light-gray-200 text-text-04 opacity-70"
            : "cursor-pointer hover:border-white/75 hover:bg-white/[0.09] hover:text-primary"
        )}
      >
        {hasPreview ? (
          <>
            <Image
              src={image?.previewUrl ?? ""}
              alt={image?.fileName ?? "첨부 이미지"}
              fill
              unoptimized
              sizes="304px"
              className="object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-center text-[12px] font-bold text-white">
              <span className="block truncate">{image?.fileName}</span>
            </span>
          </>
        ) : (
          <>
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/60 bg-white/[0.05] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.88),inset_0_-1px_0_rgba(110,58,245,0.06),0_10px_28px_rgba(110,58,245,0.08)] backdrop-blur-2xl backdrop-saturate-150">
              <Camera className="h-6 w-6" strokeWidth={1.9} />
            </span>
            <span className="mt-4 max-w-full truncate text-center text-[13px] font-bold leading-none text-ink-emphasis">
              {image?.fileName ?? "와인 리스트 사진 올리기"}
            </span>
            {!image ? (
              <span className="mt-2 text-center text-[11px] font-medium text-ink-muted">
                사진을 선택하거나 이곳에 올려주세요
              </span>
            ) : null}
          </>
        )}
      </label>

      {isLoading ? (
        <div
          role="status"
          aria-label="와인 메뉴판 분석 중"
          className="absolute inset-0 z-10 flex cursor-wait items-center rounded-[20px] border border-white/70 bg-[#EEF1FA]/95 px-5 backdrop-blur-xl"
        >
          <span className="sr-only">와인 메뉴판 분석 중</span>
          <div className="w-full space-y-3" aria-hidden="true">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="flex h-[62px] animate-pulse items-center gap-3 rounded-[12px] border border-white/75 bg-white/[0.38] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]"
                style={{ animationDelay: `${index * 140}ms` }}
              >
                <span className="h-[46px] w-[38px] shrink-0 rounded-[8px] bg-primary/[0.12]" />
                <span className="min-w-0 flex-1 space-y-2">
                  <span className="block h-2.5 w-3/4 rounded-full bg-primary/[0.14]" />
                  <span className="block h-2 w-full rounded-full bg-primary/[0.08]" />
                  <span className="block h-2 w-1/2 rounded-full bg-primary/[0.08]" />
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
