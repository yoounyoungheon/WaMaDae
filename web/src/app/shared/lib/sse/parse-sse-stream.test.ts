import { describe, expect, it } from "vitest";
import { parseSseStream } from "./parse-sse-stream";

function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

async function collect<T>(stream: ReadableStream<Uint8Array>): Promise<T[]> {
  const events: T[] = [];
  for await (const event of parseSseStream<T>(stream)) {
    events.push(event);
  }
  return events;
}

describe("parseSseStream", () => {
  it("data: 프레임을 이벤트 단위로 파싱한다", async () => {
    const events = await collect<{ type: string }>(
      streamFromChunks([
        'data:{"type":"STREAM","data":{"body":"a"}}\n\n',
        'data:{"type":"JSON","data":{"rank":1}}\n\n',
      ])
    );
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe("STREAM");
    expect(events[1].type).toBe("JSON");
  });

  it("이벤트 경계에서 잘려 도착한 청크를 합쳐 파싱한다", async () => {
    const events = await collect<{ data: { body: string } }>(
      streamFromChunks([
        'data:{"type":"STREAM",',
        '"data":{"body":"안녕"}}\n',
        "\n",
      ])
    );
    expect(events).toHaveLength(1);
    expect(events[0].data.body).toBe("안녕");
  });

  it("JSON이 아닌 프레임과 주석은 건너뛴다", async () => {
    const events = await collect<{ type: string }>(
      streamFromChunks([
        ":keep-alive\n\n",
        "data:not-json\n\n",
        'data:{"type":"STREAM","data":{"body":"ok"}}\n\n',
      ])
    );
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("STREAM");
  });

  it("종료 시 마지막 빈 줄이 없는 프레임도 처리한다", async () => {
    const events = await collect<{ type: string }>(
      streamFromChunks(['data:{"type":"JSON","data":{}}'])
    );
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("JSON");
  });
});
