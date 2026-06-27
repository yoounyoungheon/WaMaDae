import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WineRecommendationResultPage from "./WineRecommendationResultPage";
import { wineRecommendationResultFixture } from "./wine-recommendation-result.fixture";

const meta: Meta<typeof WineRecommendationResultPage> = {
  title: "Feature/wine-recommendation-result/WineRecommendationResultPage",
  component: WineRecommendationResultPage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    result: {
      control: "object",
      description: "Server Component가 조회해 전달하는 추천 결과입니다.",
    },
    className: {
      control: "text",
    },
  },
  args: {
    result: wineRecommendationResultFixture,
  },
  decorators: [
    (Story) => (
      <div className="flex h-[715px] w-[390px] flex-col overflow-hidden bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof WineRecommendationResultPage>;

export const Default: Story = {};

export const EmptyRecommendations: Story = {
  args: {
    result: {
      ...wineRecommendationResultFixture,
      wines: [],
      followUpQuestions: [],
    },
  },
};

export const LongWineData: Story = {
  args: {
    result: {
      ...wineRecommendationResultFixture,
      wines: [
        {
          ...wineRecommendationResultFixture.wines[0],
          koreanName:
            "매우 긴 이름을 가진 샤또 라 로즈 드 비트락 그랑 리저브 루즈 2020",
          englishName:
            "Very Long Chateau La Rose de Vitrac Grand Reserve Rouge 2020",
          description:
            "부드러운 타닌과 은은한 오크향, 긴 여운이 있어 천천히 마시기 좋은 레드와인입니다",
        },
        ...wineRecommendationResultFixture.wines.slice(1),
      ],
    },
  },
};
