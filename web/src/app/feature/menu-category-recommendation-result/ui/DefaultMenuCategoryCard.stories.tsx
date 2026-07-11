import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DEFAULT_MENU_CATEGORIES } from "../model/default-menu-categories";
import DefaultMenuCategoryCard from "./DefaultMenuCategoryCard";

const meta: Meta<typeof DefaultMenuCategoryCard> = {
  title: "Feature/menu-category-recommendation-result/DefaultMenuCategoryCard",
  component: DefaultMenuCategoryCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    category: {
      control: "object",
      description: "표시할 기본 메뉴 카테고리입니다.",
    },
    isSelected: {
      control: "boolean",
      description: "선택 강조 스타일을 표시할지 여부입니다.",
    },
    onToggle: {
      action: "toggle",
      description: "기본 메뉴 카테고리를 선택 또는 선택 해제할 때 호출됩니다.",
    },
    className: {
      control: "text",
      description: "카드에 추가할 className입니다.",
    },
  },
  render: (args) => (
    <div className="w-[104px] bg-background-03 p-0">
      <DefaultMenuCategoryCard {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof DefaultMenuCategoryCard>;

export const Default: Story = {
  args: {
    category: DEFAULT_MENU_CATEGORIES[1],
  },
};

export const Selected: Story = {
  args: {
    category: DEFAULT_MENU_CATEGORIES[4],
    isSelected: true,
  },
};
