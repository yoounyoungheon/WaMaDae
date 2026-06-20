import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import TableKeywordCard from "./TableKeywordCard";
import type { TableKeyword } from "@/app/entity/table-keyword/model/table-keyword.type";

const keyword: TableKeyword = {
  id: "meat",
  name: "고기",
  emojiPath: "/images/table-keywords/meat.svg",
  displayOrder: 1,
};

const meta: Meta<typeof TableKeywordCard> = {
  title: "Feature/table-keyword-select/TableKeywordCard",
  component: TableKeywordCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    keyword: {
      control: "object",
      description: "카드에 표시할 테이블 키워드 도메인 데이터입니다.",
    },
    isSelected: {
      control: "boolean",
      description: "현재 키워드의 선택 여부입니다.",
    },
    onToggle: {
      action: "toggled",
      description: "카드 선택/해제 시 호출되는 핸들러입니다.",
    },
    className: {
      control: "text",
      description: "카드 root에 추가할 className입니다.",
    },
  },
  args: {
    keyword,
    isSelected: false,
  },
  render: (args) => (
    <div className="w-[104px] bg-background-03 p-0">
      <TableKeywordCard {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof TableKeywordCard>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
};

export const FocusVisible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 키보드 포커스를 재현해 보라색 focus-visible outline을 보여준다.
    await userEvent.tab();
    const checkbox = canvas.getByRole("checkbox");
    checkbox.focus();
  },
};

export const LongName: Story = {
  args: {
    keyword: {
      ...keyword,
      id: "stew-soup",
      name: "얼큰한 찌개와 뜨끈한 국물 요리",
      emojiPath: "/images/table-keywords/stew-soup.svg",
    },
  },
};
