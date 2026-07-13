import { parseSseStream } from "@/app/shared/lib/sse/parse-sse-stream";
import type {
  ChatStreamEvent,
  PairingStreamEvent,
  WinePairingChatRequest,
  WinePairingRequest,
} from "../model/wine-pairing.type";

type ErrorResponse = {
  message?: string;
};

/**
 * 브라우저 전용 페어링 스트림.
 * same-origin BFF만 호출하고 SSE 프레임을 순서대로 yield한다.
 */
export async function* streamWinePairing(
  request: WinePairingRequest,
  chatId: string,
  signal?: AbortSignal
): AsyncGenerator<PairingStreamEvent, void, undefined> {
  const body = await openBffStream(
    "/api/wine-pairing/stream/pairing",
    request,
    chatId,
    "와인 추천을 불러오지 못했습니다.",
    signal
  );

  yield* parseSseStream<PairingStreamEvent>(body);
}

/** 브라우저 전용 후속 채팅 스트림. 답변 텍스트 청크 프레임을 yield한다. */
export async function* streamWinePairingChat(
  request: WinePairingChatRequest,
  chatId: string,
  signal?: AbortSignal
): AsyncGenerator<ChatStreamEvent, void, undefined> {
  const body = await openBffStream(
    "/api/wine-pairing/stream/chat",
    request,
    chatId,
    "채팅 응답을 불러오지 못했습니다.",
    signal
  );

  yield* parseSseStream<ChatStreamEvent>(body);
}

async function openBffStream(
  path: string,
  request: unknown,
  chatId: string,
  fallbackMessage: string,
  signal?: AbortSignal
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "X-Chat-Id": chatId,
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallbackMessage));
  }
  if (!response.body) {
    throw new Error(fallbackMessage);
  }

  return response.body;
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as ErrorResponse;
    return data.message || fallback;
  } catch {
    return fallback;
  }
}
