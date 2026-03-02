import type { Meta, StoryObj } from "@storybook/nextjs";
import WineCard from "./WineCard";

const meta: Meta<typeof WineCard> = {
  title: "Feature/wine/WineCard",
  component: WineCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    name: { control: "text" },
    description: { control: "text" },
    imageUrl: { control: "text" },
    priceLabel: { control: "text" },
    isSelected: { control: "boolean" },
    className: { control: "text" },
  },
  args: {
    name: "Chianti Classico",
    description: "체리와 스파이스 향이 조화로운 미디엄 바디 레드 와인",
    imageUrl: "/carrot4.jpeg",
    priceLabel: "₩39,000",
    isSelected: false,
  },
};

export default meta;

type Story = StoryObj<typeof WineCard>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
};

export const LongDescription: Story = {
  args: {
    name: "Cloudy Bay Sauvignon Blanc",
    description:
      "시트러스와 허브 노트가 선명하고 산도가 좋은 화이트 와인으로 해산물과 잘 어울립니다.",
    priceLabel: "₩55,000",
  },
};
