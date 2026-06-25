import type { ChangeEvent } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/app/utils/style/helper";
import { WINE_MENU_IMAGE_ACCEPT } from "@/app/entity/wine/model/wine-menu-image";
import type { PhotoUploadBoxProps } from "./wine-list-select.props";

const DEFAULT_ACCEPT = WINE_MENU_IMAGE_ACCEPT;
const WINE_MENU_IMAGE_INPUT_ID = "wine-menu-image-input";

export default function PhotoUploadBox({
  image,
  accept = DEFAULT_ACCEPT,
  disabled = false,
  onFileChange,
  className,
}: PhotoUploadBoxProps) {
  const hasPreview = Boolean(image?.previewUrl);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileChange(event.target.files?.[0] ?? null);
    event.currentTarget.value = "";
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        id={WINE_MENU_IMAGE_INPUT_ID}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={handleChange}
      />
      <label
        htmlFor={disabled ? undefined : WINE_MENU_IMAGE_INPUT_ID}
        aria-disabled={disabled}
        aria-label={
          image
            ? `${image.fileName} 이미지 다시 선택`
            : "와인 메뉴판 이미지 첨부"
        }
        className={cn(
          "relative flex min-h-[186px] w-full flex-col items-center justify-center overflow-hidden rounded-[14px] border border-dashed border-main-gray-200 bg-white px-6 py-8 text-text-03 transition-colors",
          disabled
            ? "cursor-not-allowed bg-main-light-gray-200 text-text-04 opacity-70"
            : "cursor-pointer hover:border-primary-main hover:text-primary-main"
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
            <ImageIcon className="h-9 w-9 shrink-0" strokeWidth={1.8} />
            <span className="mt-3 max-w-full truncate text-center text-[12px] font-bold leading-none">
              {image?.fileName ?? "이미지 첨부하기"}
            </span>
          </>
        )}
      </label>
    </div>
  );
}
