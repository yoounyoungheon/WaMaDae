import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/app/shared/api/query-client";
import type { Wine } from "@/app/entity/wine/model/wine.type";
import WineListSelectPage from "./WineListSelectPage";
import { cacheKnownWines } from "../lib/cache-known-wines";
import { WineListSelectionProvider } from "../model/wine-list-selection-provider";

const selectedWines: Wine[] = [
  {
    id: "analyzed-wine-1",
    name: "몬테스 알파 카베르네 소비뇽",
    imageUrl: "/ExampleImage.png",
    rating: 4.3,
    title: "몬테스 알파 카베르네 소비뇽 2021",
    recommendationText: "진한 풍미를 원한다면 추천",
    priceLabel: "35,000원",
  },
  {
    id: "analyzed-wine-2",
    name: "샤토 마고",
    imageUrl: "/ExampleImage.png",
    rating: 4.7,
    title: "샤토 마고 그랑 크뤼 2019",
    recommendationText: "부드러운 탄닌과 긴 여운",
    priceLabel: "82,000원",
  },
];

const meta: Meta<typeof WineListSelectPage> = {
  title: "Feature/wine-list/WineListSelectPage",
  component: WineListSelectPage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: {
      control: "text",
      description: "화면 wrapper에 추가할 className입니다.",
    },
  },
  render: (args) => (
    <div className="flex h-[621px] w-[350px] overflow-hidden bg-white">
      <WineListSelectPage {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof WineListSelectPage>;

/**
 * p1_1: 메뉴판 업로드 영역이 열려 있고 선택된 와인이 없는 초기 상태.
 * 글로벌 preview decorator가 독립 QueryClient와 선택 store를 제공한다.
 */
export const Default: Story = {};

/**
 * p1_2: 분석/검색으로 선택한 와인이 WINES 영역에 표시된 상태.
 * known wines cache와 selectedWineIds를 채운 뒤 렌더링한다.
 */
export const WithSelectedWines: Story = {
  render: (args) => <WithSelectedWinesPreview {...args} />,
};

function WithSelectedWinesPreview(
  args: React.ComponentProps<typeof WineListSelectPage>
) {
  const [queryClient] = useState(() => {
    const client = createQueryClient();
    cacheKnownWines(client, selectedWines);
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <WineListSelectionProvider
        initialSelectedWineIds={selectedWines.map((wine) => wine.id)}
      >
        <div className="flex h-[621px] w-[350px] overflow-hidden bg-white">
          <WineListSelectPage {...args} />
        </div>
      </WineListSelectionProvider>
    </QueryClientProvider>
  );
}
