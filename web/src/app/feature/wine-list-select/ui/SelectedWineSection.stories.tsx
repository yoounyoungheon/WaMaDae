import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SelectedWineSection from "./SelectedWineSection";
import type { Wine } from "@/app/entity/wine/model/wine.type";

const wines: Wine[] = [
  {
    id: "selected-wine-1",
    name: "몬테스 알파 카베르네 소비뇽",
    imageUrl: "/ExampleImage.png",
    rating: 4.3,
    title: "몬테스 알파 카베르네 소비뇽 2021",
    recommendationText: "진한 풍미를 원한다면 추천",
    priceLabel: "35,000원",
  },
  {
    id: "selected-wine-2",
    name: "샤토 마고",
    imageUrl: "/ExampleImage.png",
    rating: 4.7,
    title: "샤토 마고 그랑 크뤼 2019",
    recommendationText: "부드러운 탄닌과 긴 여운",
    priceLabel: "82,000원",
  },
];

const meta: Meta<typeof SelectedWineSection> = {
  title: "Feature/wine-list/SelectedWineSection",
  component: SelectedWineSection,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    wines: {
      control: "object",
      description: "WINES 영역에 표시할 선택 와인 목록입니다.",
    },
    title: {
      control: "text",
      description: "선택 와인 섹션 제목입니다.",
    },
    onRemoveWine: {
      action: "wineRemoved",
      description: "선택 와인 제거 버튼 클릭 핸들러입니다.",
    },
    className: {
      control: "text",
      description: "섹션 wrapper에 추가할 className입니다.",
    },
  },
  args: {
    wines: [wines[0]],
    title: "WINES",
  },
  render: (args) => (
    <div className="w-[328px] bg-background-03 p-0">
      <SelectedWineSection {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof SelectedWineSection>;

export const Default: Story = {};

export const MultipleWines: Story = {
  args: {
    wines,
  },
};

export const WithRemoveAction: Story = {
  args: {
    wines,
  },
  render: (args) => (
    <div className="w-[328px] bg-background-03 p-0">
      <SelectedWineSection
        {...args}
        onRemoveWine={(wineId) => args.onRemoveWine?.(wineId)}
      />
    </div>
  ),
};
