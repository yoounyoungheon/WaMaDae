import { type NextRequest } from "next/server";
import { API_PATH } from "@/app/utils/http/api-query";

const buildRequestUrl = () => {
  if (!API_PATH) {
    throw new Error("챗봇 API base URL이 설정되지 않았습니다.");
  }

  return new URL("/v1/ai/chat/answer", API_PATH).toString();
};

export async function GET(request: NextRequest) {
  const chatId = request.nextUrl.searchParams.get("chatId");
  const lastEventId = request.nextUrl.searchParams.get("lastEventId");

  if (!chatId) {
    return Response.json({ message: "chatId가 필요합니다." }, { status: 400 });
  }

  try {
    const upstreamResponse = await fetch(buildRequestUrl(), {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        "X-Chat-Id": chatId,
        ...(lastEventId ? { "Last-Event-ID": lastEventId } : {}),
      },
      cache: "no-store",
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const errorText = await upstreamResponse.text();

      return Response.json(
        { message: errorText || "SSE 연결에 실패했습니다." },
        { status: upstreamResponse.status || 500 },
      );
    }

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
