import type { Meta, StoryObj } from "@storybook/nextjs";
import RecommendPage from "./RecommendPage";

const meta: Meta<typeof RecommendPage> = {
  title: "Feature/wine/RecommendPage",
  component: RecommendPage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    cards: { control: "object" },
    uploadButtonLabel: { control: "text" },
    analysisStatus: { control: "boolean" },
    className: { control: "text" },
  },
  args: {
    className: "w-[360px]",
    uploadButtonLabel: "와인 추천받기",
    analysisStatus: true,
  },
};

export default meta;

type Story = StoryObj<typeof RecommendPage>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[360px]">
      <RecommendPage {...args} />
    </div>
  ),
};

export const EmptyList: Story = {
  args: {
    cards: [],
  },
  render: Default.render,
};

export const BeforeAnalysis: Story = {
  args: {
    analysisStatus: false,
  },
  render: Default.render,
};
