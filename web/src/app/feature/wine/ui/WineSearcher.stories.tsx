import type { Meta, StoryObj } from "@storybook/nextjs";
import WineSearcher, { type WineSearcherItem } from "./WineSearcher";

const sampleResults: WineSearcherItem[] = [
  {
    name: "Chianti Classico",
    description: "체리와 스파이스 향이 조화로운 미디엄 바디 레드 와인",
    imageUrl: "/carrot4.jpeg",
    priceLabel: "₩39,000",
  },
  {
    name: "Cloudy Bay Sauvignon Blanc",
    description:
      "시트러스와 허브 노트가 선명하고 산도가 좋아 해산물과 잘 어울리는 화이트 와인",
    imageUrl: "/carrot5.jpeg",
    priceLabel: "₩55,000",
  },
  {
    name: "Bordeaux Reserve",
    description: "블랙커런트와 오크 향이 균형 잡힌 풀바디 레드 와인",
    imageUrl: "/carrot6.jpeg",
    priceLabel: "₩49,000",
  },
];

const meta: Meta<typeof WineSearcher> = {
  title: "Feature/wine/WineSearcher",
  component: WineSearcher,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isSearchEnabled: { control: "boolean" },
    searchPlaceholder: { control: "text" },
    preSearchMessage: { control: "text" },
    emptyResultMessage: { control: "text" },
    completeLabel: { control: "text" },
    initialQuery: { control: "text" },
    initialResults: { control: "object" },
    className: { control: "text" },
    fetchWineSearch: {
      control: false,
      description: "검색어를 받아 와인 목록을 반환하는 비동기 함수",
    },
    onCompleted: { action: "completed" },
  },
  args: {
    isSearchEnabled: true,
    searchPlaceholder: "예: 샤블리, 메를로, 까베르네 소비뇽",
    preSearchMessage: "메뉴판에 있는 와인 명을 직접 입력해 추가해보세요.",
    emptyResultMessage: "검색 결과가 없어요. 와인 이름을 다시 확인해보세요.",
    completeLabel: "완료",
    initialQuery: "",
    initialResults: [],
    fetchWineSearch: async (query: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return sampleResults.filter((wine) =>
        `${wine.name} ${wine.description}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    },
  },
};

export default meta;

type Story = StoryObj<typeof WineSearcher>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[360px]">
      <WineSearcher {...args} />
    </div>
  ),
};

export const WithInitialResults: Story = {
  args: {
    initialQuery: "추천 와인",
    initialResults: sampleResults,
  },
  render: Default.render,
};

export const WithPartialResults: Story = {
  args: {
    initialQuery: "chianti",
    initialResults: [sampleResults[0]],
  },
  render: Default.render,
};

export const NoResults: Story = {
  args: {
    initialQuery: "unknown wine",
    initialResults: [],
    emptyResultMessage: "검색 결과가 없어요. 와인 이름을 다시 확인해보세요.",
  },
  render: Default.render,
};

export const SearchDisabled: Story = {
  args: {
    isSearchEnabled: false,
  },
  render: Default.render,
};
