import type { Meta, StoryObj } from "@storybook/nextjs";
import { ChatLog } from "./ChatLog";
import { WineRecommendView } from "./WineRecommendView";

const meta: Meta<typeof ChatLog> = {
  title: "Feature/chat/ChatLog",
  component: ChatLog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    chats: { control: "object" },
  },
  args: {
    chats: [
      {
        chatId: "1",
        message: "오늘 파스타랑 어울리는 와인 추천해줘",
        time: new Date().toISOString(),
        isMine: true,
      },
      {
        chatId: "2",
        message: "좋아요! 파스타 종류에 따라 다르지만 기본적으로 이런 와인들이 잘 어울립니다.",
        time: new Date().toISOString(),
        isMine: false,
        infoPanel: <WineRecommendView />,
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof ChatLog>;

export const Default: Story = {
  render: (args) => (
    <div className="h-[420px] w-[360px] rounded-xl border border-slate-200 bg-white">
      <ChatLog {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    chats: [],
  },
  render: Default.render,
};
