import type { Meta, StoryObj } from "@storybook/nextjs";
import { WineRecommendView } from "./WineRecommendView";

const meta: Meta<typeof WineRecommendView> = {
  title: "Feature/chat/WineRecommendView",
  component: WineRecommendView,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof WineRecommendView>;

export const Default: Story = {
  render: () => (
    <div className="w-[360px]">
      <WineRecommendView />
    </div>
  ),
};
