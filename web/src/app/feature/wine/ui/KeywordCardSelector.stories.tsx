import type { Meta, StoryObj } from "@storybook/nextjs";
import KeywordCardSelector from "./KeywordCardSelector";

const meta: Meta<typeof KeywordCardSelector> = {
  title: "Feature/wine/KeywordCardSelector",
  component: KeywordCardSelector,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    keywords: {
      control: "object",
      description: "선택 가능한 키워드 목록입니다.",
    },
    wines: {
      control: "object",
      description: "다음 화면으로 함께 전달할 와인 목록입니다.",
    },
    nextButtonLabel: {
      control: "text",
    },
    className: {
      control: "text",
    },
  },
  args: {
    keywords: ["파스타", "스테이크", "치즈", "해산물", "샐러드", "디저트"],
    wines: ["르 아모 쇼비뇽 블랑", "샤또 마고"],
    nextButtonLabel: "다음",
  },
};

export default meta;

type Story = StoryObj<typeof KeywordCardSelector>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[360px]">
      <KeywordCardSelector {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    keywords: [],
  },
  render: Default.render,
};
