import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import MenuCategoryItem from "./MenuCategoryItem";

const meta: Meta<typeof MenuCategoryItem> = {
  title: "Feature/menu-category-recommendation-result/MenuCategoryItem",
  component: MenuCategoryItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    category: {
      control: "text",
      description: "표시할 메뉴 카테고리 문자열입니다.",
    },
    className: {
      control: "text",
      description: "item에 추가할 className입니다.",
    },
    isSelected: {
      control: "boolean",
      description: "선택 강조 스타일을 표시할지 여부입니다.",
    },
    onToggle: {
      action: "toggle",
      description: "메뉴 카테고리를 선택 또는 선택 해제할 때 호출됩니다.",
    },
  },
  render: (args) => (
    <ul className="w-[314px] bg-background-03 p-4">
      <MenuCategoryItem {...args} />
    </ul>
  ),
};

export default meta;

type Story = StoryObj<typeof MenuCategoryItem>;

export const Default: Story = {
  args: {
    category: "레드 와인",
  },
};

export const LongName: Story = {
  args: {
    category:
      "숙성된 하드 치즈와 곁들이기 좋은 풀바디 레드 와인 페어링 메뉴 카테고리",
  },
};

export const Selected: Story = {
  args: {
    category: "숙성 치즈",
    isSelected: true,
  },
};
