import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WineSearchResultItem from "./WineSearchResultItem";
import type { WineSearchItem } from "@/app/entity/wine/model/wine.type";

const wine: WineSearchItem = {
  id: "wine-search-1",
  name: "와인 이름 1",
  regionAndType: "프랑스, 보르도",
  searchPriceLabel: "25,000원",
  priceLabel: "35,000원",
  imageUrl: "/ExampleImage.png",
  rating: 4.3,
  title: "몬테스 알파 카베르네 소비뇽 2021",
  recommendationText: "진한 풍미를 원한다면 추천",
};

const meta: Meta<typeof WineSearchResultItem> = {
  title: "Feature/wine-list/WineSearchResultItem",
  component: WineSearchResultItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    wine: {
      control: "object",
      description: "검색 결과 row에 표시할 와인 정보입니다.",
    },
    isSelected: {
      control: "boolean",
      description: "이미 WINES 목록에 추가된 와인인지 여부입니다.",
    },
    onSelect: {
      action: "selected",
      description: "row 선택 시 호출됩니다.",
    },
    className: {
      control: "text",
      description: "row button에 추가할 className입니다.",
    },
  },
  args: {
    wine,
    isSelected: false,
  },
  render: (args) => (
    <div className="w-[304px] overflow-hidden rounded-xl border border-main-light-gray-600 bg-white">
      <WineSearchResultItem {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof WineSearchResultItem>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
};

export const LongName: Story = {
  args: {
    wine: {
      ...wine,
      name: "샤토 라 투르 그랑 크뤼 클라세 아주 긴 와인 이름",
      regionAndType: "프랑스, 보르도, 카베르네 소비뇽 블렌드",
    },
  },
};
