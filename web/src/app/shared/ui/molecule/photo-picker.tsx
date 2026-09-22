"use client";

import { useId, type ChangeEvent } from "react";
import Image from "next/image";
import { Camera, X } from "lucide-react";
import { cn } from "@/app/utils/style/helper";

export type PhotoPickerPreview = {
  id: string;
  fileName: string;
  previewUrl: string;
};

export interface PhotoPickerProps {
  /** 현재 선택된 이미지 미리보기 목록. */
  previews: PhotoPickerPreview[];
  accept?: string;
  /** 첨부 가능한 최대 개수. 도달하면 추가 타일을 숨긴다. */
  maxCount?: number;
  disabled?: boolean;
  isLoading?: boolean;
  emptyLabel?: string;
  emptyHint?: string;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  className?: string;
}

/**
 * 여러 이미지를 선택·미리보기·제거할 수 있는 공용 업로드 picker.
 *
 * 선택 순서를 유지하고, 최대 개수에 도달하면 추가 타일을 숨긴다.
 * 파일 검증(형식/크기/중복)은 소비자에게 위임하고, 여기서는 선택 UI만 담당한다.
 */
export default function PhotoPicker({
  previews,
  accept,
  maxCount,
  disabled = false,
  isLoading = false,
  emptyLabel = "사진 올리기",
  emptyHint = "사진을 선택하거나 이곳에 올려주세요",
  onAddFiles,
  onRemoveFile,
  className,
}: PhotoPickerProps) {
  const inputId = useId();
  const isInteractionDisabled = disabled || isLoading;
  const isLimitReached =
    typeof maxCount === "number" && previews.length >= maxCount;
  const canAddMore = !isLimitReached;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      onAddFiles(files);
    }
    event.currentTarget.value = "";
  };

  const hasPreviews = previews.length > 0;

  // 로딩 중에는 스켈레톤만 단독으로 렌더한다.
  // (오버레이 방식은 반투명 뒤로 이전 미리보기 UI가 비쳐 보이는 흔적이 남는다.)
  if (isLoading) {
    return (
      <div
        role="status"
        aria-busy
        aria-label="이미지 분석 중"
        className={cn(
          "flex min-h-[174px] w-full cursor-wait items-center rounded-[20px] border border-white/70 bg-[#EEF1FA] px-5 py-6",
          className
        )}
      >
        <span className="sr-only">이미지 분석 중</span>
        <div className="w-full space-y-3" aria-hidden="true">
          {[0, 1].map((index) => (
            <div
              key={index}
              className="flex h-[62px] animate-pulse items-center gap-3 rounded-[12px] border border-white/75 bg-white/[0.6] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]"
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
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple
        disabled={isInteractionDisabled || !canAddMore}
        className="sr-only"
        onChange={handleChange}
      />

      {hasPreviews ? (
        <ul className="grid grid-cols-3 gap-2.5">
          {previews.map((preview) => (
            <li
              key={preview.id}
              className="relative aspect-square overflow-hidden rounded-[14px] border border-white/60 bg-white/[0.08]"
            >
              <Image
                src={preview.previewUrl}
                alt={preview.fileName}
                fill
                unoptimized
                sizes="120px"
                className="object-cover"
              />
              {!isInteractionDisabled ? (
                <button
                  type="button"
                  aria-label={`${preview.fileName} 제거`}
                  onClick={() => onRemoveFile(preview.id)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.4} />
                </button>
              ) : null}
            </li>
          ))}

          {canAddMore ? (
            <li className="aspect-square">
              <label
                htmlFor={isInteractionDisabled ? undefined : inputId}
                aria-disabled={isInteractionDisabled}
                aria-label="이미지 추가"
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/60 bg-white/[0.04] text-ink-secondary transition-colors",
                  isInteractionDisabled
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer hover:border-white/80 hover:bg-white/[0.09] hover:text-primary"
                )}
              >
                <Camera className="h-6 w-6" strokeWidth={1.9} aria-hidden />
                <span className="text-[12px] font-bold">추가</span>
              </label>
            </li>
          ) : null}
        </ul>
      ) : (
        <label
          htmlFor={isInteractionDisabled ? undefined : inputId}
          aria-disabled={isInteractionDisabled}
          aria-label={emptyLabel}
          className={cn(
            "relative flex min-h-[174px] w-full flex-col items-center justify-center overflow-hidden rounded-[20px] border border-white/55 bg-white/[0.04] px-6 py-8 text-ink-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.82),inset_0_-1px_0_rgba(110,58,245,0.06),0_18px_42px_rgba(72,52,112,0.045)] backdrop-blur-2xl backdrop-saturate-150 transition-colors",
            isInteractionDisabled
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer hover:border-white/75 hover:bg-white/[0.09] hover:text-primary"
          )}
        >
          <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/60 bg-white/[0.05] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.88),inset_0_-1px_0_rgba(110,58,245,0.06),0_10px_28px_rgba(110,58,245,0.08)] backdrop-blur-2xl backdrop-saturate-150">
            <Camera className="h-6 w-6" strokeWidth={1.9} />
          </span>
          <span className="mt-4 max-w-full truncate text-center text-[13px] font-bold leading-none text-ink-emphasis">
            {emptyLabel}
          </span>
          <span className="mt-2 text-center text-[11px] font-medium text-ink-muted">
            {emptyHint}
          </span>
        </label>
      )}
    </div>
  );
}
