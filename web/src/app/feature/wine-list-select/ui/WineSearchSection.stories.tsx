import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { type ComponentProps, useEffect, useState } from "react";
import WineSearchSection from "./WineSearchSection";
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

const meta: Meta<typeof WineSearchSection> = {
  title: "Feature/wine-list/WineSearchSection",
  component: WineSearchSection,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    query: {
      control: "text",
      description: "검색 input 값입니다.",
    },
    results: {
      control: "object",
      description: "검색 결과 목록입니다.",
    },
    selectedWineIds: {
      control: "object",
      description: "이미 WINES 목록에 추가된 와인 id 목록입니다.",
    },
    isLoading: {
      control: "boolean",
      description: "검색 요청 진행 상태입니다.",
    },
    errorMessage: {
      control: "text",
      description: "검색 요청 실패 시 표시할 메시지입니다.",
    },
    onQueryChange: {
      action: "queryChanged",
      description: "검색어 변경 시 호출됩니다.",
    },
    onSelectWine: {
      action: "wineSelected",
      description: "검색 결과 선택 시 호출됩니다.",
    },
    className: {
      control: "text",
      description: "검색 섹션 wrapper에 추가할 className입니다.",
    },
  },
  args: {
    query: "",
    results,
    selectedWineIds: [],
    isLoading: false,
  },
  render: (args) => <StatefulWineSearchSection {...args} />,
};

export default meta;

type Story = StoryObj<typeof WineSearchSection>;

function StatefulWineSearchSection(
  args: ComponentProps<typeof WineSearchSection>
) {
  const [query, setQuery] = useState(args.query);

  useEffect(() => {
    setQuery(args.query);
  }, [args.query]);

  return (
    <div className="w-[304px] bg-background-03">
      <WineSearchSection
        {...args}
        query={query}
        onQueryChange={(nextQuery) => {
          args.onQueryChange?.(nextQuery);
          setQuery(nextQuery);
        }}
      />
    </div>
  );
}

export const Default: Story = {};

export const WithSelectedWine: Story = {
  args: {
    selectedWineIds: ["wine-search-1"],
  },
};

export const EmptyResults: Story = {
  args: {
    results: [],
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    errorMessage: "와인 검색에 실패했습니다.",
  },
};
