import type { Meta, StoryObj } from "@storybook/nextjs";
import HomePage from "./HomePage";

const meta: Meta<typeof HomePage> = {
  title: "Feature/home/HomePage",
  component: HomePage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    userName: { control: "text" },
    actionHref: { control: "text" },
    actionIcon: {
      control: false,
      description: "인트로 액션 버튼에 렌더링할 ReactNode",
    },
    wineHistoryList: { control: "object" },
    wineRecommendCards: { control: "object" },
    communityCards: { control: "object" },
    className: { control: "text" },
  },
  args: {
    className: "w-[360px]",
  },
};

export default meta;

type Story = StoryObj<typeof HomePage>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[360px]">
      <HomePage {...args} />
    </div>
  ),
};

export const CustomData: Story = {
  args: {
    userName: "와인러버",
    actionHref: "/chat",
    wineHistoryList: [
      { id: "h1", name: "Merlot", image: "/carrot1.png" },
      { id: "h2", name: "Riesling", image: "/carrot2.png" },
    ],
    wineRecommendCards: [
      {
        name: "Merlot Reserve",
        description: "부드러운 타닌과 베리 풍미가 특징인 레드 와인",
        imageUrl: "/carrot1.png",
        priceLabel: "₩42,000",
      },
      {
        name: "Riesling Dry",
        description: "산뜻한 산미와 미네랄감이 돋보이는 화이트 와인",
        imageUrl: "/carrot2.png",
        priceLabel: "₩36,000",
      },
    ],
    communityCards: [
      {
        title: "봄철 와인 추천",
        description: "가벼운 음식과 어울리는 화이트 와인을 공유해요.",
        likeCount: 16,
        commentCount: 4,
        imageUrl: "/carrot3.png",
      },
      {
        title: "레드 와인 입문",
        description: "탄닌이 너무 강하지 않은 레드 추천 부탁드립니다.",
        likeCount: 29,
        commentCount: 11,
      },
    ],
  },
  render: Default.render,
};
