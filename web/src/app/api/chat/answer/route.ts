import { type NextRequest } from "next/server";
import { requestServerApi } from "@/app/utils/http/server-api";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const chatId = request.nextUrl.searchParams.get("chatId");
  const lastEventId = request.nextUrl.searchParams.get("lastEventId");
  const requestId = crypto.randomUUID();

  if (!chatId) {
    console.error("[chat/answer] missing chatId", {
      requestId,
      url: request.url,
    });

    return Response.json({ message: "chatId가 필요합니다." }, { status: 400 });
  }

  try {
    console.info("[chat/answer] upstream request started", {
      requestId,
      chatId,
      hasLastEventId: Boolean(lastEventId),
    });

    const upstreamResponse = await requestServerApi("/v1/ai/chat/answer", {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        "X-Chat-Id": chatId,
        ...(lastEventId ? { "Last-Event-ID": lastEventId } : {}),
      },
      cache: "no-store",
    });

    console.info("[chat/answer] upstream response received", {
      requestId,
      chatId,
      status: upstreamResponse.status,
      ok: upstreamResponse.ok,
      hasBody: Boolean(upstreamResponse.body),
      contentType: upstreamResponse.headers.get("content-type"),
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const errorText = await upstreamResponse.text();

      console.error("[chat/answer] upstream response invalid", {
        requestId,
        chatId,
        status: upstreamResponse.status,
        errorText,
      });

      return Response.json(
        { message: errorText || "SSE 연결에 실패했습니다." },
        { status: upstreamResponse.status || 500 },
      );
    }

    console.info("[chat/answer] streaming response proxied", {
      requestId,
      chatId,
    });

    return new Response(upstreamResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "SSE 연결 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
