/** multipart part 이름. 여러 이미지는 같은 이름으로 반복한다. */
export const WINE_MENU_IMAGE_PART_NAME = "wineMenuImages";

/** 파일당 최대 크기(백엔드 계약: 각 이미지 최대 10MiB). */
export const MAX_WINE_MENU_IMAGE_SIZE = 10 * 1024 * 1024;

/** 한 번의 분석에 첨부 가능한 최대 이미지 수(프론트/BFF 운영 정책). */
export const MAX_WINE_MENU_IMAGE_COUNT = 5;

/** 전체 첨부 이미지 총량 상한(프론트/BFF 운영 정책). */
export const MAX_WINE_MENU_IMAGE_TOTAL_SIZE = 50 * 1024 * 1024;

export const WINE_MENU_IMAGE_TYPES = ["image/jpeg", "image/png"] as const;

export const WINE_MENU_IMAGE_ACCEPT = WINE_MENU_IMAGE_TYPES.join(",");

/** 허용 확장자(백엔드는 파일명 확장자도 png/jpg/jpeg만 허용한다). */
export const WINE_MENU_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg"] as const;

const wineMenuImageTypes: readonly string[] = WINE_MENU_IMAGE_TYPES;
const wineMenuImageExtensions: readonly string[] = WINE_MENU_IMAGE_EXTENSIONS;

/** 파일명 확장자가 허용 목록(png/jpg/jpeg)에 있는지 검사한다. */
export function hasAllowedWineMenuImageExtension(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return wineMenuImageExtensions.includes(extension);
}

/** 단일 파일의 형식/크기/확장자 검증. 문제가 없으면 null. */
export function getWineMenuImageValidationMessage(
  file: Pick<File, "size" | "type" | "name">
): string | null {
  if (file.size === 0) {
    return "비어 있는 파일은 첨부할 수 없습니다.";
  }

  if (file.size > MAX_WINE_MENU_IMAGE_SIZE) {
    return "이미지는 각 10MB 이하로 첨부해 주세요.";
  }

  if (
    !wineMenuImageTypes.includes(file.type) ||
    !hasAllowedWineMenuImageExtension(file.name)
  ) {
    return "JPG, PNG 이미지만 첨부할 수 있습니다.";
  }

  return null;
}

export type WineMenuImageSelectionError = {
  message: string;
  /** 개수/총량 초과처럼 개별 파일이 아니라 선택 전체에 대한 오류인지 여부. */
  isSelectionLevel: boolean;
};

/**
 * 이미 선택된 파일 목록에 새 파일들을 더할 수 있는지 검증한다.
 * 개수 상한, 총량 상한, 파일별 형식/크기, 중복(name+size+lastModified)을 확인한다.
 */
export function validateWineMenuImageAddition(
  existing: readonly File[],
  additions: readonly File[]
): WineMenuImageSelectionError | null {
  const dedupedAdditions = additions.filter(
    (file) => !existing.some((current) => isSameFile(current, file))
  );

  if (existing.length + dedupedAdditions.length > MAX_WINE_MENU_IMAGE_COUNT) {
    return {
      message: `이미지는 최대 ${MAX_WINE_MENU_IMAGE_COUNT}장까지 첨부할 수 있습니다.`,
      isSelectionLevel: true,
    };
  }

  for (const file of dedupedAdditions) {
    const message = getWineMenuImageValidationMessage(file);
    if (message) {
      return { message, isSelectionLevel: false };
    }
  }

  const totalSize = [...existing, ...dedupedAdditions].reduce(
    (sum, file) => sum + file.size,
    0
  );
  if (totalSize > MAX_WINE_MENU_IMAGE_TOTAL_SIZE) {
    return {
      message: "첨부한 이미지 총 용량이 너무 큽니다. 일부를 제거해 주세요.",
      isSelectionLevel: true,
    };
  }

  return null;
}

export function isSameFile(a: File, b: File): boolean {
  return (
    a.name === b.name && a.size === b.size && a.lastModified === b.lastModified
  );
}
