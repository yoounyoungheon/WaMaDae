import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SelectedWineCard from "./SelectedWineCard";
import type { Wine } from "@/app/entity/wine/model/wine.type";

const wine: Wine = {
  id: "selected-wine-1",
  name: "몬테스 알파 카베르네 소비뇽",
  imageUrl: "/ExampleImage.png",
  rating: 4.3,
  title: "몬테스 알파 카베르네 소비뇽 2021",
  recommendationText: "진한 풍미를 원한다면 추천",
  priceLabel: "35,000원",
};

const meta: Meta<typeof SelectedWineCard> = {
  title: "Feature/wine-list/SelectedWineCard",
  component: SelectedWineCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    wine: {
      control: "object",
      description: "WINES 카드에 표시할 선택 와인 정보입니다.",
    },
    onRemove: {
      action: "removed",
      description: "선택 와인 제거 버튼 클릭 핸들러입니다.",
    },
    className: {
      control: "text",
      description: "카드 wrapper에 추가할 className입니다.",
    },
  },
  args: {
    wine,
  },
  render: (args) => (
    <div className="w-[328px] bg-background-03 p-0">
      <SelectedWineCard {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof SelectedWineCard>;

export const Default: Story = {};

export const LongTitle: Story = {
  args: {
    wine: {
      ...wine,
      title: "몬테스 알파 카베르네 소비뇽 프리미엄 리저브 빈티지 2021",
      recommendationText: "스테이크와 진한 소스 요리에 잘 어울리는 와인",
    },
  },
};

export const WithRemoveAction: Story = {
  render: (args) => (
    <div className="w-[328px] bg-background-03 p-0">
      <SelectedWineCard
        {...args}
        onRemove={(wineId) => args.onRemove?.(wineId)}
      />
    </div>
  ),
};
