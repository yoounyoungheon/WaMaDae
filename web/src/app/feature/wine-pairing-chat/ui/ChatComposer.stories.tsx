import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ChatComposer from "./ChatComposer";

const meta: Meta<typeof ChatComposer> = {
  title: "Feature/wine-pairing-chat/ChatComposer",
  component: ChatComposer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "입력과 전송을 막을지 여부입니다.",
    },
    placeholder: {
      control: "text",
      description: "입력창 placeholder입니다.",
    },
    onSend: {
      action: "send",
      description: "후속 질문 전송 핸들러입니다.",
    },
    className: {
      control: "text",
      description: "composer에 추가할 className입니다.",
    },
  },
  render: (args) => (
    <div className="w-[314px] bg-white p-4">
      <ChatComposer {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof ChatComposer>;

export const Enabled: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "와인 추천이 끝나면 질문할 수 있어요",
  },
};
