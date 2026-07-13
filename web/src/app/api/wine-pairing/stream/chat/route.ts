import { NextResponse } from "next/server";
import {
  openWinePairingChatStream,
  WinePairingBackendError,
} from "@/app/entity/wine-pairing/api/wine-pairing.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_MESSAGE_LENGTH = 2000;
const MAX_CHAT_ID_LENGTH = 100;

type ChatRequestBody = {
  message?: unknown;
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

  const body = (await request.json().catch(() => null)) as ChatRequestBody | null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { message: "질문을 입력해 주세요." },
      { status: 400 }
    );
  }

  try {
    const backendResponse = await openWinePairingChatStream(
      { message },
      chatId,
      request.signal
    );

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
        { message: "채팅 요청이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "채팅 응답을 불러오지 못했습니다." },
      { status: 502 }
    );
  }
}
