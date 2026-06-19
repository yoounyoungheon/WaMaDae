export const MAX_WINE_MENU_IMAGE_SIZE = 10 * 1024 * 1024;

export const WINE_MENU_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const WINE_MENU_IMAGE_ACCEPT = WINE_MENU_IMAGE_TYPES.join(",");
const wineMenuImageTypes: readonly string[] = WINE_MENU_IMAGE_TYPES;

export function getWineMenuImageValidationMessage(
  file: Pick<File, "size" | "type">
): string | null {
  if (file.size === 0) {
    return "비어 있는 파일은 첨부할 수 없습니다.";
  }

  if (file.size > MAX_WINE_MENU_IMAGE_SIZE) {
    return "이미지는 10MB 이하로 첨부해 주세요.";
  }

  if (!wineMenuImageTypes.includes(file.type)) {
    return "JPG, PNG, WEBP, HEIC 이미지만 첨부할 수 있습니다.";
  }

  return null;
}
