import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import MenuCategoryList from "./MenuCategoryList";

const meta: Meta<typeof MenuCategoryList> = {
  title: "Feature/menu-category-recommendation-result/MenuCategoryList",
  component: MenuCategoryList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    categories: {
      control: "object",
      description: "표시할 메뉴 카테고리 문자열 목록입니다.",
    },
    className: {
      control: "text",
      description: "리스트에 추가할 className입니다.",
    },
    selectedCategories: {
      control: "object",
      description: "선택 강조로 표시할 서버 추천 메뉴 카테고리 이름 목록입니다.",
    },
    onToggleCategory: {
      action: "toggle",
      description: "서버 추천 메뉴 카테고리를 선택 또는 선택 해제할 때 호출됩니다.",
    },
  },
  render: (args) => (
    <div className="w-[314px] bg-background-03 p-4">
      <MenuCategoryList {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof MenuCategoryList>;

export const Default: Story = {
  args: {
    categories: ["소고기 스테이크", "숙성 치즈", "해산물"],
  },
};

export const ManyItems: Story = {
  args: {
    categories: [
      "레드 와인",
      "화이트 와인",
      "스파클링 와인",
      "로제 와인",
      "디저트 와인",
      "내추럴 와인",
      "숙성 하드 치즈 페어링",
      "해산물 요리 페어링",
    ],
  },
};

export const WithSelected: Story = {
  args: {
    categories: ["소고기 스테이크", "숙성 치즈", "해산물"],
    selectedCategories: ["숙성 치즈"],
  },
};

export const Interactive: Story = {
  args: {
    categories: ["소고기 스테이크", "숙성 치즈", "해산물"],
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
      <div className="w-[314px] bg-background-03 p-4">
        {selectedCategories.length > 0 ? (
          <p className="mb-4 rounded-xl border border-[#e8c6ff] bg-[#fcf6ff] px-3.5 py-3 text-[13px] font-bold leading-none text-primary-main">
            {selectedCategories.length}개 선택됨
          </p>
        ) : null}
        <MenuCategoryList
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
