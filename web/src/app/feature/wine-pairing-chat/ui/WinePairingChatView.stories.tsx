import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  clearWinePairingRequest,
  saveWinePairingRequest,
} from "@/app/entity/wine-pairing/lib/wine-pairing-request-storage";
import type {
  PairingSlidePayload,
  PairingStreamWine,
} from "@/app/entity/wine-pairing/model/wine-pairing.type";
import WinePairingChatView from "./WinePairingChatView";

const sampleWine = {
  id: "11111111-1111-4111-8111-111111111111",
  wineName: "샤또 라 로즈 드 비트락 루즈",
  vintage: 2020,
  alcohol: 13,
  price: [
    {
      amount: 55000,
      currency: "KRW",
      currencySign: "₩",
      koreanUnit: "원",
    },
  ],
  country: "France",
  region: "Bordeaux",
} satisfies PairingStreamWine;

const samplePayloads: PairingSlidePayload[] = [
  {
    pairingId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    rank: 1,
    wine: sampleWine,
    comment: "부드러운 레드와인이 필요하다면 이 친구로",
    reason:
      "된장의 감칠맛이 와인의 과실향을 더 또렷하게 만들어줌. 부담 없이 마시기 좋음. 가성비 괜찮음.",
  },
  {
    pairingId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    rank: 2,
    wine: {
      ...sampleWine,
      id: "22222222-2222-4222-8222-222222222222",
      wineName: "몬테스 알파 카베르네 소비뇽",
      country: "Chile",
      region: "Colchagua Valley",
    },
    comment: "진한 풍미를 원한다면 추천",
    reason: "스테이크와 진한 소스 요리에 잘 어울리는 묵직한 바디감이 있어요.",
  },
];

function pairingFrames(payloads: PairingSlidePayload[]): unknown[] {
  return payloads.flatMap((payload) => [
    {
      type: "STREAM",
      data: { fieldName: "rank", hasNext: false, body: String(payload.rank) },
    },
    {
      type: "STREAM",
      data: {
        fieldName: "name",
        hasNext: false,
        body: payload.wine.wineName,
      },
    },
    {
      type: "STREAM",
      data: { fieldName: "comment", hasNext: false, body: payload.comment },
    },
    {
      type: "STREAM",
      data: { fieldName: "reason", hasNext: false, body: payload.reason },
    },
    { type: "JSON", data: payload },
  ]);
}

function chatFrames(answer: string): unknown[] {
  return answer
    .split(" ")
    .map((word) => ({
      type: "STREAM",
      data: { body: `${word} ` },
    }));
}

function sseResponse(
  frames: unknown[],
  { frameDelayMs = 120, close = true }: { frameDelayMs?: number; close?: boolean } = {}
) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const frame of frames) {
        controller.enqueue(encoder.encode(`data:${JSON.stringify(frame)}\n\n`));
        await new Promise((resolve) => setTimeout(resolve, frameDelayMs));
      }
      if (close) {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Story별로 sessionStorage 스냅샷과 스트림 BFF 응답을 스텁한다.
 * cleanup으로 fetch와 sessionStorage를 복원해 상태 누수를 막는다.
 */
function stubStoryEnv(options: {
  seedRequest?: boolean;
  onPairing?: () => Response;
  onChat?: () => Response;
}) {
  return async () => {
    const originalFetch = globalThis.fetch;

    clearWinePairingRequest();
    if (options.seedRequest) {
      saveWinePairingRequest({
        wineIds: [
          "11111111-1111-4111-8111-111111111111",
          "22222222-2222-4222-8222-222222222222",
        ],
        menuCategories: [{ name: "스테이크" }, { name: "파스타" }],
      });
    }

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/wine-pairing/stream/pairing") && options.onPairing) {
        return options.onPairing();
      }
      if (url.includes("/api/wine-pairing/stream/chat") && options.onChat) {
        return options.onChat();
      }
      return jsonResponse({ message: "stubbed" }, 404);
    }) as typeof fetch;

    return () => {
      globalThis.fetch = originalFetch;
      clearWinePairingRequest();
    };
  };
}

const withViewLayout: Decorator = function ViewLayoutDecorator(Story) {
  return (
    <div className="flex h-[720px] w-[360px] flex-col overflow-hidden bg-background-03">
      <Story />
    </div>
  );
};

const meta: Meta<typeof WinePairingChatView> = {
  title: "Feature/wine-pairing-chat/WinePairingChatView",
  component: WinePairingChatView,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [withViewLayout],
};

export default meta;

type Story = StoryObj<typeof WinePairingChatView>;

/** 페어링이 완료되고 채팅 입력이 가능한 상태. 질문을 입력하면 스텁 답변이 스트리밍된다. */
export const PairingDone: Story = {
  beforeEach: stubStoryEnv({
    seedRequest: true,
    onPairing: () => sseResponse(pairingFrames(samplePayloads), { frameDelayMs: 60 }),
    onChat: () =>
      sseResponse(
        chatFrames(
          "첫 번째 와인은 타닌이 부드럽고 산도가 적당해서 된장 소스의 감칠맛을 살려줘요."
        ),
        { frameDelayMs: 80 }
      ),
  }),
};

/** 프레임이 천천히 도착해 슬라이드가 페인팅되는 중인 상태. */
export const PairingStreaming: Story = {
  beforeEach: stubStoryEnv({
    seedRequest: true,
    onPairing: () =>
      sseResponse(pairingFrames(samplePayloads), {
        frameDelayMs: 1200,
        close: false,
      }),
  }),
};

export const PairingError: Story = {
  beforeEach: stubStoryEnv({
    seedRequest: true,
    onPairing: () =>
      jsonResponse({ message: "와인 추천을 불러오지 못했습니다." }, 502),
  }),
};

export const NoRequest: Story = {
  beforeEach: stubStoryEnv({ seedRequest: false }),
};
