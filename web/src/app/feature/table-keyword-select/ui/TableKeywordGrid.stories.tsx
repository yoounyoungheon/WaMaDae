import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import TableKeywordGrid from "./TableKeywordGrid";
import type {
  TableKeyword,
  TableKeywordId,
} from "@/app/entity/table-keyword/model/table-keyword.type";

const keywords: TableKeyword[] = [
  { id: "meat", name: "고기", emojiPath: "/images/table-keywords/meat.svg", displayOrder: 1 },
  { id: "pizza", name: "피자", emojiPath: "/images/table-keywords/pizza.svg", displayOrder: 2 },
  { id: "cheese", name: "치즈", emojiPath: "/images/table-keywords/cheese.svg", displayOrder: 3 },
  { id: "pasta", name: "파스타", emojiPath: "/images/table-keywords/pasta.svg", displayOrder: 4 },
  { id: "salad", name: "샐러드", emojiPath: "/images/table-keywords/salad.svg", displayOrder: 5 },
  { id: "sushi", name: "회/초밥", emojiPath: "/images/table-keywords/sushi.svg", displayOrder: 6 },
  { id: "noodles", name: "면 요리", emojiPath: "/images/table-keywords/noodles.svg", displayOrder: 7 },
  { id: "stew-soup", name: "찌개/국", emojiPath: "/images/table-keywords/stew-soup.svg", displayOrder: 8 },
  { id: "dessert", name: "디저트", emojiPath: "/images/table-keywords/dessert.svg", displayOrder: 9 },
];

const meta: Meta<typeof TableKeywordGrid> = {
  title: "Feature/table-keyword-select/TableKeywordGrid",
  component: TableKeywordGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    keywords: {
      control: "object",
      description: "Grid에 렌더링할 테이블 키워드 목록입니다.",
    },
    selectedKeywordIds: {
      control: "object",
      description: "현재 선택된 키워드 ID 목록입니다.",
    },
    onToggleKeyword: {
      action: "toggled",
      description: "카드 선택/해제 핸들러입니다.",
    },
    className: {
      control: "text",
      description: "Grid에 추가할 className입니다.",
    },
  },
  args: {
    keywords,
    selectedKeywordIds: [],
  },
  render: (args) => (
    <div className="w-[350px] bg-background-03 p-4">
      <TableKeywordGrid {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof TableKeywordGrid>;

export const Default: Story = {
  render: (args) => {
    const InteractiveGrid = () => {
      const [selectedKeywordIds, setSelectedKeywordIds] = useState<
        TableKeywordId[]
      >([]);

      const handleToggle = (keywordId: TableKeywordId) => {
        args.onToggleKeyword?.(keywordId);
        setSelectedKeywordIds((previous) =>
          previous.includes(keywordId)
            ? previous.filter((id) => id !== keywordId)
            : [...previous, keywordId]
        );
      };

      return (
        <div className="w-[350px] bg-background-03 p-4">
          <TableKeywordGrid
            keywords={args.keywords}
            selectedKeywordIds={selectedKeywordIds}
            onToggleKeyword={handleToggle}
          />
        </div>
      );
    };

    return <InteractiveGrid />;
  },
};

export const WithSelectedItems: Story = {
  args: {
    selectedKeywordIds: ["meat", "salad"],
  },
};

export const Empty: Story = {
  args: {
    keywords: [],
  },
};
