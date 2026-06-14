import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import ActionErrorDialog from "./ActionErrorDialog";

const meta: Meta<typeof ActionErrorDialog> = {
  title: "Components/ActionErrorDialog",
  component: ActionErrorDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    open: { control: "boolean" },
    message: { control: "text" },
    title: { control: "text" },
    onOpenChange: { action: "openChanged" },
  },
  args: {
    open: true,
    title: "요청을 처리할 수 없습니다.",
    message: "와인 메뉴 OCR 요청에 실패했습니다. 잠시 후 다시 시도해주세요.",
  },
};

export default meta;

type Story = StoryObj<typeof ActionErrorDialog>;

export const Default: Story = {};

export const LongMessage: Story = {
  args: {
    message:
      "지원하지 않는 이미지 형식입니다. PNG 또는 JPEG 파일인지 확인한 뒤 다시 시도해주세요.",
  },
};
