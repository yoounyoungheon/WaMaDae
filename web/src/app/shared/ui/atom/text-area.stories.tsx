import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import TextArea from "./text-area";

const meta: Meta<typeof TextArea> = {
  title: "Components/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    autoResize: { control: "boolean" },
    maxRows: { control: "number" },
    rows: { control: "number" },
    onValueChange: { action: "valueChanged" },
  },
  args: {
    placeholder: "메시지를 입력하세요...",
    autoResize: true,
    maxRows: 6,
    rows: 1,
    disabled: false,
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[360px] border rounded-lg p-1">
      <TextArea {...args} />
    </div>
  ),
};

export const WithLongContent: Story = {
  args: {
    defaultValue:
      "와인 추천 부탁해요. 오늘은 친구들과 매콤한 음식을 먹을 예정이고, 너무 무겁지 않은 바디감이 좋습니다.",
  },
  render: Default.render,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "비활성화된 텍스트 영역",
  },
  render: Default.render,
};
