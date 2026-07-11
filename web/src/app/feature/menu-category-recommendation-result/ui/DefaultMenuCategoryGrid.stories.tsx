import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { DEFAULT_MENU_CATEGORIES } from "../model/default-menu-categories";
import DefaultMenuCategoryGrid from "./DefaultMenuCategoryGrid";

const meta: Meta<typeof DefaultMenuCategoryGrid> = {
  title: "Feature/menu-category-recommendation-result/DefaultMenuCategoryGrid",
  component: DefaultMenuCategoryGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    categories: {
      control: "object",
      description: "표시할 기본 메뉴 카테고리 목록입니다.",
    },
    selectedCategories: {
      control: "object",
      description: "선택 강조로 표시할 기본 메뉴 카테고리 이름 목록입니다.",
    },
    onToggleCategory: {
      action: "toggle",
      description: "기본 메뉴 카테고리를 선택 또는 선택 해제할 때 호출됩니다.",
    },
    className: {
      control: "text",
      description: "Grid에 추가할 className입니다.",
    },
  },
  render: (args) => (
    <div className="w-[360px] bg-background-03 p-[23px]">
      <DefaultMenuCategoryGrid {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof DefaultMenuCategoryGrid>;

export const Default: Story = {
  args: {
    categories: DEFAULT_MENU_CATEGORIES,
  },
};

export const WithSelected: Story = {
  args: {
    categories: DEFAULT_MENU_CATEGORIES,
    selectedCategories: ["고기", "샐러드"],
  },
};

export const Interactive: Story = {
  args: {
    categories: DEFAULT_MENU_CATEGORIES,
  },
  render: (args) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const toggleCategory = (category: string) => {
      setSelectedCategories((currentCategories) =>
        currentCategories.includes(category)
          ? currentCategories.filter(
              (selectedCategory) => selectedCategory !== category
            )
          : [...currentCategories, category]
      );
    };

    return (
      <div className="w-[360px] bg-background-03 p-[23px]">
        {selectedCategories.length > 0 ? (
          <p className="mb-5 rounded-xl border border-[#e8c6ff] bg-[#fcf6ff] px-3.5 py-3 text-[13px] font-bold leading-none text-primary-main">
            {selectedCategories.length}개 선택됨
          </p>
        ) : null}
        <DefaultMenuCategoryGrid
          {...args}
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
        />
      </div>
    );
  },
};

export const Empty: Story = {
  args: {
    categories: [],
  },
};
