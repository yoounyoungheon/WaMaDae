import type { Meta, StoryObj } from "@storybook/nextjs";
import WineRecommendCard from "./WineRecommendCard";

const meta: Meta<typeof WineRecommendCard> = {
  title: "Feature/wine/WineRecommendCard",
  component: WineRecommendCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    image: { control: "text" },
    rank: { control: "number" },
    title: { control: "text" },
    reason: { control: "text" },
    comment: { control: "text" },
    className: { control: "text" },
  },
  args: {
    image: "/carrot4.jpeg",
    rank: 1,
    title: "샤또 라 로즈 드 비트락 루즈 2020",
    reason:
      "된장의 감칠맛이 와인의 과실향을 더 또렷하게 만들어주고, 부담 없이 마시기 좋습니다.",
    comment: "부드러운 레드와인이 필요하다면 이 친구로",
  },
};

export default meta;

type Story = StoryObj<typeof WineRecommendCard>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[280px] pt-6">
      <WineRecommendCard {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    image: undefined,
    rank: undefined,
    title: undefined,
    reason: undefined,
    comment: undefined,
  },
  render: Default.render,
};

export const LongCopy: Story = {
  args: {
    rank: 2,
    title: "르 아모 쇼비뇽 블랑",
    reason:
      "산뜻한 산도와 허브 뉘앙스가 해산물과 크림 소스의 무게를 정리해주면서 입안을 깔끔하게 마무리해줍니다.",
    comment: "해산물과 함께라면 실패 확률이 낮은 화이트",
  },
  render: Default.render,
};
