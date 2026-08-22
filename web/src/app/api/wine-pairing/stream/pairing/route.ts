import { NextResponse } from "next/server";
import {
  openWinePairingStream,
  WinePairingBackendError,
} from "@/app/entity/wine-pairing/api/wine-pairing.server";
import type { WinePairingRequest } from "@/app/entity/wine-pairing/model/wine-pairing.type";
import { normalizeUuid } from "@/app/shared/lib/validation/uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_WINES = 100;
const MAX_CATEGORIES = 50;
const MAX_CATEGORY_LENGTH = 100;
const MAX_CHAT_ID_LENGTH = 100;

type PairingRequestBody = {
  wineIds?: unknown;
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

    if (error instanceof WinePairingBackendError && error.status === 404) {
      return NextResponse.json(
        { message: "선택한 와인을 찾을 수 없습니다." },
        { status: 404 }
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
 * `wineIds[]`는 UUID 문자열, `menuCategories[].name`은 공백 아닌 문자열이어야 한다.
 */
function parsePairingRequest(
  body: PairingRequestBody | null
): WinePairingRequest | null {
  if (!body) {
    return null;
  }

  const { wineIds, menuCategories } = body;

  if (
    !Array.isArray(wineIds) ||
    wineIds.length === 0 ||
    wineIds.length > MAX_WINES
  ) {
    return null;
  }
  if (
    !Array.isArray(menuCategories) ||
    menuCategories.length === 0 ||
    menuCategories.length > MAX_CATEGORIES
  ) {
    return null;
  }

  const parsedWineIds: string[] = [];
  for (const wineId of wineIds) {
    const normalizedWineId = normalizeUuid(wineId);
    if (!normalizedWineId) {
      return null;
    }
    parsedWineIds.push(normalizedWineId);
  }

  const parsedCategories: WinePairingRequest["menuCategories"] = [];
  for (const category of menuCategories) {
    if (typeof category !== "object" || category === null) {
      return null;
    }

    const { name } = category as { name?: unknown };
    if (
      typeof name !== "string" ||
      name.trim().length === 0 ||
      name.length > MAX_CATEGORY_LENGTH
    ) {
      return null;
    }
    parsedCategories.push({ name: name.trim() });
  }

  return {
    wineIds: [...new Set(parsedWineIds)],
    menuCategories: dedupeCategories(parsedCategories),
  };
}

function dedupeCategories(
  categories: WinePairingRequest["menuCategories"]
): WinePairingRequest["menuCategories"] {
  const seen = new Set<string>();
  return categories.filter((category) => {
    if (seen.has(category.name)) {
      return false;
    }
    seen.add(category.name);
    return true;
  });
}
