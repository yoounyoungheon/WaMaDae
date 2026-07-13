/**
 * `text/event-stream` ReadableStream을 `data:` 프레임 단위로 파싱하는 async generator.
 *
 * 백엔드(Spring WebFlux SSE)는 프레임마다 `data:{json}\n\n`을 전송한다.
 * 이벤트 경계(빈 줄)로 버퍼를 분리하고, `data:` 라인을 JSON으로 파싱해 yield한다.
 * 주석(`:`)이나 JSON이 아닌 프레임은 건너뛴다(keep-alive 등 forward-compat).
 */
export async function* parseSseStream<T>(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<T, void, undefined> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let separatorIndex = findEventSeparator(buffer);
      while (separatorIndex !== null) {
        const rawEvent = buffer.slice(0, separatorIndex.start);
        buffer = buffer.slice(separatorIndex.end);

        const parsed = parseEventData<T>(rawEvent);
        if (parsed !== null) {
          yield parsed;
        }

        separatorIndex = findEventSeparator(buffer);
      }
    }

    // 종료 시 남은 버퍼도 하나의 이벤트로 처리한다(마지막 빈 줄이 잘린 경우 대비).
    const remaining = parseEventData<T>(buffer);
    if (remaining !== null) {
      yield remaining;
    }
  } finally {
    reader.releaseLock();
  }
}

type EventSeparator = { start: number; end: number };

/** 이벤트 경계(`\n\n` 또는 `\r\n\r\n`) 위치를 찾는다. */
function findEventSeparator(buffer: string): EventSeparator | null {
  const lf = buffer.indexOf("\n\n");
  const crlf = buffer.indexOf("\r\n\r\n");

  if (lf === -1 && crlf === -1) {
    return null;
  }
  if (crlf !== -1 && (lf === -1 || crlf < lf)) {
    return { start: crlf, end: crlf + 4 };
  }
  return { start: lf, end: lf + 2 };
}

/** 이벤트 블록에서 `data:` 라인을 모아 JSON으로 파싱한다. 파싱 불가 시 null. */
function parseEventData<T>(rawEvent: string): T | null {
  const dataLines = rawEvent
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).replace(/^ /, ""));

  if (dataLines.length === 0) {
    return null;
  }

  try {
    return JSON.parse(dataLines.join("\n")) as T;
  } catch {
    return null;
  }
}
