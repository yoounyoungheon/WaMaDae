import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WineSearchResultList from "./WineSearchResultList";
import type { WineSearchItem } from "@/app/entity/wine/model/wine.type";

const results: WineSearchItem[] = [
  {
    id: "wine-search-1",
    name: "와인 이름 1",
    regionAndType: "프랑스, 보르도",
    searchPriceLabel: "25,000원",
    priceLabel: "35,000원",
    imageUrl: "/ExampleImage.png",
    rating: 4.3,
    title: "몬테스 알파 카베르네 소비뇽 2021",
    recommendationText: "진한 풍미를 원한다면 추천",
  },
  {
    id: "wine-search-2",
    name: "와인 이름 2",
    regionAndType: "프랑스, 보르도",
    searchPriceLabel: "25,000원",
    priceLabel: "82,000원",
    imageUrl: "/ExampleImage.png",
    rating: 4.1,
    title: "샤토 마고 그랑 크뤼 2019",
    recommendationText: "부드러운 탄닌과 긴 여운",
  },
  {
    id: "wine-search-3",
    name: "와인 이름 3",
    regionAndType: "프랑스, 보르도",
    searchPriceLabel: "25,000원",
    priceLabel: "42,000원",
    imageUrl: "/ExampleImage.png",
    rating: 4.0,
    title: "루이라뚜르 샤블리 2022",
    recommendationText: "상큼한 산미를 원한다면 추천",
  },
];

const meta: Meta<typeof WineSearchResultList> = {
  title: "Feature/wine-list/WineSearchResultList",
  component: WineSearchResultList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    results: {
      control: "object",
      description: "검색 결과 목록입니다.",
    },
    selectedWineIds: {
      control: "object",
      description: "이미 WINES 목록에 추가된 와인 id 목록입니다.",
    },
    emptyMessage: {
      control: "text",
      description: "검색 결과가 없을 때 표시할 문구입니다.",
    },
    onSelectWine: {
      action: "wineSelected",
      description: "검색 결과 row 선택 시 호출됩니다.",
    },
    className: {
      control: "text",
      description: "검색 결과 리스트 wrapper에 추가할 className입니다.",
    },
  },
  args: {
    results,
    selectedWineIds: [],
    emptyMessage: "검색 결과가 없습니다.",
  },
  render: (args) => (
    <div className="w-[304px] bg-background-03">
      <WineSearchResultList {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof WineSearchResultList>;

export const Default: Story = {};

export const WithSelectedWine: Story = {
  args: {
    selectedWineIds: ["wine-search-1"],
  },
};

export const Empty: Story = {
  args: {
    results: [],
  },
};
