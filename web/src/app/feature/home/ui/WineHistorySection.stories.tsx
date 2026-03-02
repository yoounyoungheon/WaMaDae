import type { Meta, StoryObj } from "@storybook/nextjs";
import WineHistorySection from "./WineHistorySection";

const sampleWineList = [
  { id: 1, name: "Chianti Classico", image: "/carrot4.jpeg" },
  { id: 2, name: "Sauvignon Blanc", image: "/carrot1.png" },
  { id: 3, name: "Pinot Noir", image: "/carrot2.png" },
  { id: 4, name: "Riesling", image: "/carrot3.png" },
  { id: 5, name: "Shiraz Reserve", image: "/carrot4.jpeg" },
];

const meta: Meta<typeof WineHistorySection> = {
  title: "Feature/home/WineHistorySection",
  component: WineHistorySection,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    wineList: { control: "object" },
    className: { control: "text" },
    getWineHref: {
      control: false,
      description: "와인 카드 클릭 시 이동할 링크 생성 함수",
    },
  },
  args: {
    wineList: sampleWineList,
    className: "w-[360px]",
  },
};

export default meta;

type Story = StoryObj<typeof WineHistorySection>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[360px]">
      <WineHistorySection {...args} />
    </div>
  ),
};

export const WithLinks: Story = {
  render: (args) => (
    <div className="w-[360px]">
      <WineHistorySection
        {...args}
        getWineHref={(wine) => `/wine/${wine.id}`}
      />
    </div>
  ),
};
