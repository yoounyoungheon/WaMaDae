import type { Meta, StoryObj } from "@storybook/nextjs";
import CommnunitySummaryCard from "./CommnunitySummaryCard";

const meta: Meta<typeof CommnunitySummaryCard> = {
  title: "Feature/commnunity/CommnunitySummaryCard",
  component: CommnunitySummaryCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    likeCount: { control: "number" },
    commentCount: { control: "number" },
    imageUrl: { control: "text" },
    className: { control: "text" },
  },
  args: {
    title: "오늘의 와인 추천 모음",
    description:
      "저녁 모임에 어울리는 가벼운 레드 와인 리스트를 공유합니다. 음식 페어링도 함께 확인해보세요.",
    likeCount: 24,
    commentCount: 8,
    imageUrl: "/carrot5.jpeg",
  },
};

export default meta;

type Story = StoryObj<typeof CommnunitySummaryCard>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[360px]">
      <CommnunitySummaryCard {...args} />
    </div>
  ),
};

export const LongText: Story = {
  args: {
    title: "주말 브런치와 잘 어울리는 화이트 와인 추천 리스트",
    description:
      "산뜻한 산미와 과실향이 좋은 화이트 와인을 중심으로 정리했습니다. 가벼운 샐러드, 파스타, 해산물 요리와 함께 마시기 좋은 조합을 소개합니다.",
    likeCount: 132,
    commentCount: 47,
  },
  render: Default.render,
};

export const WithoutImage: Story = {
  args: {
    imageUrl: undefined,
  },
  render: Default.render,
};
