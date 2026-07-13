import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ChatAnswerBubble from "./ChatAnswerBubble";

const meta: Meta<typeof ChatAnswerBubble> = {
  title: "Feature/wine-pairing-chat/ChatAnswerBubble",
  component: ChatAnswerBubble,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    turn: {
      control: "object",
      description: "질문과 스트리밍 답변을 담은 채팅 턴입니다.",
    },
    className: {
      control: "text",
      description: "말풍선 wrapper에 추가할 className입니다.",
    },
  },
  render: (args) => (
    <div className="w-[314px] bg-background-03 p-4">
      <ChatAnswerBubble {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof ChatAnswerBubble>;

export const Done: Story = {
  args: {
    turn: {
      kind: "chat",
      question: "첫 번째 와인이 잘 어울리는 이유를 알려줘",
      answer:
        "첫 번째 와인은 타닌이 부드럽고 산도가 적당해서 된장 소스의 감칠맛을 살려줘요. 과실향이 또렷해 무거운 요리에도 밀리지 않아요.",
      status: "done",
    },
  },
};

export const Streaming: Story = {
  args: {
    turn: {
      kind: "chat",
      question: "첫 번째 와인이 잘 어울리는 이유를 알려줘",
      answer: "첫 번째 와인은 타닌이 부드럽고",
      status: "streaming",
    },
  },
};

export const StreamingEmpty: Story = {
  args: {
    turn: {
      kind: "chat",
      question: "더 저렴한 대안도 있을까?",
      answer: "",
      status: "streaming",
    },
  },
};

export const Error: Story = {
  args: {
    turn: {
      kind: "chat",
      question: "이 와인 도수는 어떻게 돼?",
      answer: "",
      status: "error",
      errorMessage: "채팅 응답을 불러오지 못했습니다.",
    },
  },
};
