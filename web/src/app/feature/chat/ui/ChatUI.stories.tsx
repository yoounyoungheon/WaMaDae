import type { Meta, StoryObj } from "@storybook/nextjs";
import ChatUI from "./ChatUI";

const meta: Meta<typeof ChatUI> = {
  title: "Feature/chat/ChatUI",
  component: ChatUI,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof ChatUI>;

export const Default: Story = {
  render: () => (
    <div className="h-[640px] w-[390px] rounded-2xl border border-slate-200 bg-white p-2">
      <ChatUI />
    </div>
  ),
};
