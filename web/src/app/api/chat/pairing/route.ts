import {
  requestServerApi,
} from "@/app/utils/http/server-api";

interface PairingRequestBody {
  wines?: { id?: number; name: string }[];
  menuCategories?: string[];
}

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const chatId = request.headers.get("X-Chat-Id");
    const body = (await request.json()) as PairingRequestBody;

    if (!chatId) {
      return Response.json(
        { message: "chatId가 필요합니다." },
        { status: 400 },
      );
    }

    const upstreamResponse = await requestServerApi("/v1/ai/chat/pairing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Chat-Id": chatId,
      },
      body: JSON.stringify({
        wines: body.wines ?? [],
        menuCategories: body.menuCategories ?? [],
      }),
      cache: "no-store",
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();

      return Response.json(
        { message: errorText || "페어링 요청에 실패했습니다." },
        { status: upstreamResponse.status || 500 },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "페어링 요청 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
