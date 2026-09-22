import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import WineRecommendationSlide from "./WineRecommendationSlide";
import type { PairingSlideView } from "../model/conversation.types";

const slide: PairingSlideView = {
  imageUrl: "/images/wines/wine-red.png",
  rank: "1",
  name: "샤또 라 로즈 드 비트락 루즈 2020",
  comment: "부드러운 레드와인이 필요하다면 이 친구로",
  reason:
    "된장의 감칠맛이 와인의 과실향을 더 또렷하게 만들어줌. 부담 없이 마시기 좋음. 가성비 괜찮음.",
  wine: null,
  isCommitted: true,
};

const detailedSlide: PairingSlideView = {
  ...slide,
  wine: {
    id: "11111111-1111-4111-8111-111111111111",
    wineName: "샤또 라 로즈 드 비트락 루즈",
    vintage: 2020,
    alcohol: "13.0% ~ 13.5%",
    price: [
      {
        amount: 55000,
        currency: "KRW",
        currencySign: "₩",
        koreanUnit: "원",
      },
    ],
    country: "France",
    region: "Bordeaux",
    tannin: 4,
    body: 3,
    sweetness: 1,
    acid: 3,
    wineBottleImageUrl: "/images/wines/wine-white.png",
    variety: "Chardonnay",
    wineType: "White Wine",
    aromas: ["청사과", "시트러스", "미네랄"],
  },
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
    slide: detailedSlide,
  },
  render: (args) => (
    <div className="w-[calc(100vw-32px)] max-w-[520px] bg-background-03 p-4">
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
      ...detailedSlide,
      name: "샤또 라 로즈 드 비트락 루즈 그랑 크뤼 클라쎄 스페셜 에디션 2020",
      reason:
        "된장의 감칠맛이 와인의 과실향을 더 또렷하게 만들어줌. 부담 없이 마시기 좋음. 가성비 괜찮음. 타닌이 부드럽고 산도가 적당해 다양한 한식 메뉴와 두루 어울리며, 특히 발효 소스를 쓰는 요리와 궁합이 좋습니다.",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "추천 이유 전체 보기" })
    );
    await expect(
      canvas.getByRole("button", { name: "상세 설명 닫기" })
    ).toHaveTextContent("타닌이 부드럽고 산도가 적당해");

    await userEvent.click(
      canvas.getByRole("button", { name: "상세 설명 닫기" })
    );
    await expect(
      canvas.queryByRole("button", { name: "상세 설명 닫기" })
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: "추천 이유 전체 보기" })
    );
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
      imageUrl: "/images/wines/wine-red.png",
      rank: "1",
      name: "샤또 라 로즈 드",
      comment: "",
      reason: "",
      wine: null,
      isCommitted: false,
    },
  },
};

export const WithWineDetail: Story = {
  args: {
    slide: detailedSlide,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const detailButton = await canvas.findByRole("button", {
      name: "샤또 라 로즈 드 비트락 루즈 2020 상세 정보 보기",
    });

    await userEvent.click(detailButton);
    await expect(detailButton).toHaveAttribute("tabindex", "-1");
    await expect(
      canvas.getByRole("button", {
        name: "샤또 라 로즈 드 비트락 루즈 추천 설명으로 돌아가기",
      })
    ).toBeVisible();
  },
};

export const FlipRoundTrip: Story = {
  args: {
    slide: detailedSlide,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const detailButton = await canvas.findByRole("button", {
      name: "샤또 라 로즈 드 비트락 루즈 2020 상세 정보 보기",
    });

    await userEvent.click(detailButton);
    await userEvent.click(
      canvas.getByRole("button", {
        name: "샤또 라 로즈 드 비트락 루즈 추천 설명으로 돌아가기",
      })
    );

    await expect(detailButton).toHaveAttribute("tabindex", "0");
  },
};

/** 현재 backend pairing mapper는 `body`를 누락하므로 body가 null인 상태를 확인한다. */
export const WithNullTaste: Story = {
  args: {
    slide: {
      ...slide,
      isCommitted: true,
      wine: {
        id: "22222222-2222-4222-8222-222222222222",
        wineName: "정보가 일부 비어 있는 와인",
        vintage: null,
        alcohol: null,
        price: null,
        country: "Italy",
        region: null,
        tannin: 2,
        body: null,
        sweetness: null,
        acid: 4,
        wineBottleImageUrl: null,
      },
    },
  },
};
