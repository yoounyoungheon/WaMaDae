"use client";

import React from "react";
import Image from "next/image";
import Button from "@/app/shared/ui/atom/button";
import { Card } from "@/app/shared/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";

export type PhotoAspect = "square" | "vertical" | "auto";
export type ImageFit = "cover" | "contain";

export interface WinePhotoUploadProps {
  buttonLabel: string;
  onButtonClick?: (file: File | null) => void;
  onImageChange?: (file: File | null) => void;
  initialImageUrl?: string;
  title?: string;
  description?: string;
  className?: string;
  buttonDisabled?: boolean;
  aspect?: PhotoAspect;
  fit?: ImageFit;
  fixedSize?: number;
}

export default function WinePhotoUpload({
  buttonLabel,
  onButtonClick,
  onImageChange,
  initialImageUrl,
  title = "와인 메뉴 사진 업로드",
  description = "카드를 눌러 와인 사진 1장을 선택하세요.",
  className,
  buttonDisabled = false,
  aspect = "square",
  fit = "cover",
  fixedSize = 280,
}: WinePhotoUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    initialImageUrl ?? null
  );

  React.useEffect(() => {
    setPreviewUrl(initialImageUrl ?? null);
  }, [initialImageUrl]);

  React.useEffect(() => {
    if (!selectedFile) return;

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    onImageChange?.(file);

    event.currentTarget.value = "";
  };

  const imageFitClass = fit === "contain" ? "object-contain" : "object-cover";

  const cardClassName = cn(
    "relative shrink-0 cursor-pointer transition-colors",
    previewUrl ? "p-0 overflow-hidden" : "p-3",
    aspect === "auto"
      ? "w-full max-w-[280px]"
      : aspect === "square"
      ? "aspect-square"
      : "aspect-[3/4]",
    "border-white bg-white"
  );

  const cardStyle: React.CSSProperties | undefined =
    aspect === "auto"
      ? undefined
      : {
          width: fixedSize,
        };

  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col items-center gap-12",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Card
        role="button"
        tabIndex={0}
        onClick={handleOpenPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpenPicker();
          }
        }}
        aria-label="와인 메뉴 사진 업로드"
        className={cardClassName}
        style={cardStyle}
      >
        <div
          className={cn(
            "relative flex h-full w-full items-center justify-center p-4 text-center transition-colors",
            previewUrl ? "rounded-xl" : "rounded-lg border border-dashed",
            previewUrl
              ? "border-slate-200"
              : "border-slate-300 hover:border-primary-main",
            "bg-white"
          )}
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="선택한 와인 사진 미리보기"
              fill
              unoptimized
              className={cn("absolute inset-0 h-full w-full", imageFitClass)}
            />
          ) : null}

          {previewUrl ? (
            <div className="relative z-10 w-full bg-black/35 px-3 py-2 text-sm font-medium text-white backdrop-blur-[1px]">
              사진 변경하기
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-xs text-slate-600">{description}</p>
              <p className="text-xs text-slate-500">
                모바일에서 카메라 또는 갤러리 선택 가능
              </p>
            </div>
          )}
        </div>
      </Card>

      <Button
        variant="solid"
        type="primary"
        radius="lg"
        className="min-w-1/2 w-3/4"
        disabled={buttonDisabled}
        onClick={() => onButtonClick?.(selectedFile)}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
