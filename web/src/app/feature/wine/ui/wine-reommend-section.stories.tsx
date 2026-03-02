import type { Meta, StoryObj } from "@storybook/nextjs";
import WineRecommendSection from "./wine-reommend-section";

const meta: Meta<typeof WineRecommendSection> = {
  title: "Feature/wine/WineRecommendSection",
  component: WineRecommendSection,
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
        name: "Chianti Classico",
        description: "체리와 스파이스 향이 조화로운 미디엄 바디 레드 와인",
        imageUrl: "/carrot4.jpeg",
        priceLabel: "₩39,000",
        isSelected: false,
      },
      {
        name: "Cloudy Bay Sauvignon Blanc",
        description:
          "시트러스와 허브 노트가 선명하고 산도가 좋은 화이트 와인으로 해산물과 잘 어울립니다.",
        imageUrl: "/carrot5.jpeg",
        priceLabel: "₩55,000",
        isSelected: true,
      },
      {
        name: "Bordeaux Reserve",
        description: "블랙커런트와 오크 향이 균형 잡힌 풀바디 레드 와인",
        imageUrl: "/carrot6.jpeg",
        priceLabel: "₩49,000",
        isSelected: false,
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof WineRecommendSection>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[720px]">
      <WineRecommendSection {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    cards: [],
  },
  render: (args) => (
    <div className="w-[720px]">
      <WineRecommendSection {...args} />
    </div>
  ),
};
