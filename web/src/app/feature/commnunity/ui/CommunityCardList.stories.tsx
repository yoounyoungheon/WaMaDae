import type { Meta, StoryObj } from "@storybook/nextjs";
import CommunityCardList from "./CommunityCardList";

const meta: Meta<typeof CommunityCardList> = {
  title: "Feature/commnunity/CommunityCardList",
  component: CommunityCardList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    cards: { control: "object" },
    className: { control: "text" },
  },
  args: {
    cards: [
      {
        title: "오늘의 와인 추천 모음",
        description:
          "저녁 모임에 어울리는 가벼운 레드 와인 리스트를 공유합니다. 음식 페어링도 함께 확인해보세요.",
        likeCount: 24,
        commentCount: 8,
        imageUrl: "/carrot5.jpeg",
      },
      {
        title: "입문자를 위한 화이트 와인 가이드",
        description:
          "산뜻한 산미와 과실향 중심으로 실패 확률이 낮은 화이트 와인을 정리했습니다.",
        likeCount: 38,
        commentCount: 12,
        imageUrl: "/carrot4.jpeg",
      },
      {
        title: "가성비 와인 토론",
        description:
          "2만 원대 와인 중 만족도가 높은 제품을 중심으로 자유롭게 의견을 나눠주세요.",
        likeCount: 51,
        commentCount: 27,
        imageUrl: undefined,
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof CommunityCardList>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[360px]">
      <CommunityCardList {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    cards: [],
  },
  render: Default.render,
};
