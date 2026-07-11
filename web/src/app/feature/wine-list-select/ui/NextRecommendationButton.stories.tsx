import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Wine } from "@/app/entity/wine/model/wine.type";
import NextRecommendationButton from "./NextRecommendationButton";

const wines: Wine[] = [
  {
    id: "1",
    name: "르 아모",
    imageUrl: "/ExampleImage.png",
    rating: 4.2,
    title: "르 아모",
    recommendationText: "가벼운 레드 와인",
    priceLabel: "32,000원",
  },
  {
    id: "2",
    name: "클라우디 베이",
    imageUrl: "/ExampleImage.png",
    rating: 4.5,
    title: "클라우디 베이",
    recommendationText: "상큼한 화이트 와인",
    priceLabel: "58,000원",
  },
];

const meta: Meta<typeof NextRecommendationButton> = {
  title: "Feature/wine-list-select/NextRecommendationButton",
  component: NextRecommendationButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    wines,
  },
  render: (args) => (
    <div className="w-[360px] bg-background-03 px-6 py-5">
      <NextRecommendationButton {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof NextRecommendationButton>;

export const Default: Story = {};

export const DisabledMissingWineData: Story = {
  args: {
    hasMissingWineData: true,
  },
};

export const DisabledNoSendableWine: Story = {
  args: {
    wines: [],
  },
};
