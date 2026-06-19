import { NextResponse } from "next/server";
import { hasValidWineMenuImageSignature } from "@/app/entity/wine/api/wine-menu-image.server";
import { analyzeWineList } from "@/app/entity/wine/api/wine.server";
import {
  getWineMenuImageValidationMessage,
  MAX_WINE_MENU_IMAGE_SIZE,
} from "@/app/entity/wine/model/wine-menu-image";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data;")) {
    return NextResponse.json(
      { message: "이미지 업로드 형식이 올바르지 않습니다." },
      { status: 415 }
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_WINE_MENU_IMAGE_SIZE + 1024 * 1024
  ) {
    return NextResponse.json(
      { message: "이미지는 10MB 이하로 첨부해 주세요." },
      { status: 413 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const menuImage = formData?.get("menuImage");

  if (!(menuImage instanceof File)) {
    return NextResponse.json(
      { message: "메뉴판 이미지가 필요합니다." },
      { status: 400 }
    );
  }

  const validationMessage = getWineMenuImageValidationMessage(menuImage);
  if (validationMessage) {
    return NextResponse.json(
      { message: validationMessage },
      {
        status:
          menuImage.size > MAX_WINE_MENU_IMAGE_SIZE
            ? 413
            : menuImage.type.startsWith("image/")
            ? 400
            : 415,
      }
    );
  }

  if (!(await hasValidWineMenuImageSignature(menuImage))) {
    return NextResponse.json(
      { message: "이미지 파일의 실제 형식이 올바르지 않습니다." },
      { status: 415 }
    );
  }

  return NextResponse.json({ wines: analyzeWineList(menuImage) });
}
