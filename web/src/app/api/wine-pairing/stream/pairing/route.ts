import { NextResponse } from "next/server";
import {
  openWinePairingStream,
  WinePairingBackendError,
} from "@/app/entity/wine-pairing/api/wine-pairing.server";
import type { WinePairingRequest } from "@/app/entity/wine-pairing/model/wine-pairing.type";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_WINES = 100;
const MAX_CATEGORIES = 50;
const MAX_CATEGORY_LENGTH = 100;
const MAX_CHAT_ID_LENGTH = 100;

type PairingRequestBody = {
  wines?: unknown;
  menuCategories?: unknown;
};

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 415 }
    );
  }

  const chatId = request.headers.get("x-chat-id")?.trim() ?? "";
  if (chatId.length === 0 || chatId.length > MAX_CHAT_ID_LENGTH) {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const body = (await request
    .json()
    .catch(() => null)) as PairingRequestBody | null;

  const pairingRequest = parsePairingRequest(body);
  if (!pairingRequest) {
    return NextResponse.json(
      { message: "와인과 메뉴 카테고리를 선택해 주세요." },
      { status: 400 }
    );
  }

  try {
    const backendResponse = await openWinePairingStream(
      pairingRequest,
      chatId,
      request.signal
    );

    // 백엔드 SSE body를 그대로 파이프한다(버퍼링 방지 헤더 포함).
    return new Response(backendResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof WinePairingBackendError && error.status === 400) {
      return NextResponse.json(
        { message: "와인 페어링 요청이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "와인 추천을 불러오지 못했습니다." },
      { status: 502 }
    );
  }
}

/**
 * 페어링 요청 body를 백엔드 계약 shape으로 검증한다.
 * `wines[].id`는 정수, `menuCategories[]`는 공백 아닌 문자열이어야 한다.
 */
function parsePairingRequest(
  body: PairingRequestBody | null
): WinePairingRequest | null {
  if (!body) {
    return null;
  }

  const { wines, menuCategories } = body;

  if (!Array.isArray(wines) || wines.length === 0 || wines.length > MAX_WINES) {
    return null;
  }
  if (
    !Array.isArray(menuCategories) ||
    menuCategories.length === 0 ||
    menuCategories.length > MAX_CATEGORIES
  ) {
    return null;
  }

  const parsedWines: WinePairingRequest["wines"] = [];
  for (const wine of wines) {
    const id = (wine as { id?: unknown })?.id;
    if (typeof id !== "number" || !Number.isSafeInteger(id)) {
      return null;
    }
    parsedWines.push({ id });
  }

  const parsedCategories: string[] = [];
  for (const category of menuCategories) {
    if (
      typeof category !== "string" ||
      category.trim().length === 0 ||
      category.length > MAX_CATEGORY_LENGTH
    ) {
      return null;
    }
    parsedCategories.push(category.trim());
  }

  return { wines: parsedWines, menuCategories: parsedCategories };
}
