import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WineRecommendationSlide from "./WineRecommendationSlide";
import type { PairingSlideView } from "../model/conversation.types";

const slide: PairingSlideView = {
  imageUrl: "/ExampleImage.png",
  rank: "1",
  name: "샤또 라 로즈 드 비트락 루즈 2020",
  comment: "부드러운 레드와인이 필요하다면 이 친구로",
  reason:
    "된장의 감칠맛이 와인의 과실향을 더 또렷하게 만들어줌. 부담 없이 마시기 좋음. 가성비 괜찮음.",
  isCommitted: true,
};

const meta: Meta<typeof WineRecommendationSlide> = {
  title: "Feature/wine-pairing-chat/WineRecommendationSlide",
  component: WineRecommendationSlide,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    slide: {
      control: "object",
      description: "표시할 추천 와인 슬라이드 데이터입니다.",
    },
    className: {
      control: "text",
      description: "슬라이드에 추가할 className입니다.",
    },
  },
  args: {
    slide,
  },
  render: (args) => (
    <div className="w-[314px] bg-background-03 p-4">
      <WineRecommendationSlide {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof WineRecommendationSlide>;

export const Default: Story = {};

export const LongText: Story = {
  args: {
    slide: {
      ...slide,
      name: "샤또 라 로즈 드 비트락 루즈 그랑 크뤼 클라쎄 스페셜 에디션 2020",
      reason:
        "된장의 감칠맛이 와인의 과실향을 더 또렷하게 만들어줌. 부담 없이 마시기 좋음. 가성비 괜찮음. 타닌이 부드럽고 산도가 적당해 다양한 한식 메뉴와 두루 어울리며, 특히 발효 소스를 쓰는 요리와 궁합이 좋습니다.",
    },
  },
};

export const NoImage: Story = {
  args: {
    slide: {
      ...slide,
      imageUrl: "",
    },
  },
};

export const StreamingPainting: Story = {
  args: {
    slide: {
      imageUrl: "/ExampleImage.png",
      rank: "1",
      name: "샤또 라 로즈 드",
      comment: "",
      reason: "",
      isCommitted: false,
    },
  },
};
