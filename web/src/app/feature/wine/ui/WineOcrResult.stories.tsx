import type { Meta, StoryObj } from "@storybook/nextjs";
import WineOcrResult from "./WineOcrResult";

const meta: Meta<typeof WineOcrResult> = {
  title: "Feature/wine/WineOcrResult",
  component: WineOcrResult,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    cards: { control: "object" },
    className: { control: "text" },
    onSelect: { action: "select" },
    onDeSelect: { action: "deSelect" },
    onAllSelect: { action: "allSelect" },
    onAllDeSelect: { action: "allDeSelect" },
  },
  args: {
    cards: [
      {
        name: "Chianti Classico",
        description: "체리와 스파이스 향이 조화로운 미디엄 바디 레드 와인",
        imageUrl: "/carrot4.jpeg",
        priceLabel: "₩39,000",
      },
      {
        name: "Cloudy Bay Sauvignon Blanc",
        description:
          "시트러스와 허브 노트가 선명하고 산도가 좋은 화이트 와인으로 해산물과 잘 어울립니다.",
        imageUrl: "/carrot5.jpeg",
        priceLabel: "₩55,000",
      },
      {
        name: "Bordeaux Reserve",
        description: "블랙커런트와 오크 향이 균형 잡힌 풀바디 레드 와인",
        imageUrl: "/carrot6.jpeg",
        priceLabel: "₩49,000",
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof WineOcrResult>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[360px]">
      <WineOcrResult {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    cards: [],
  },
  render: Default.render,
};
