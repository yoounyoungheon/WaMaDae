import { NextResponse } from "next/server";
import { z } from "zod";
import { buildMysomApiUrl } from "@/app/utils/http/server-api";

const PRESIGNED_MENU_IMAGE_URL_PATH = "/v1/upload/presigned-menu-image-url";

const requestSchema = z.object({
  imageType: z.enum(["png", "jpg", "jpeg"]),
  restaurantId: z.number().int().min(1),
});

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      { message: "인증 정보가 필요합니다." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "업로드 URL 요청 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const response = await fetch(
    buildMysomApiUrl(PRESIGNED_MENU_IMAGE_URL_PATH),
    {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: await getSafeErrorMessage(response) },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}

async function getSafeErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string | null };
    return data.message || "업로드 URL 생성에 실패했습니다.";
  } catch {
    return "업로드 URL 생성에 실패했습니다.";
  }
}
