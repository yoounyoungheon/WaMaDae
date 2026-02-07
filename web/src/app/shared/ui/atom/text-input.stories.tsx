import type { Meta, StoryObj } from "@storybook/react";
import { MagnifyingGlassIcon as SearchIcon } from "@radix-ui/react-icons";
import React from "react";
import TextInput from "./text-input";

const meta: Meta<typeof TextInput> = {
  title: "Components/TextInput",
  component: TextInput,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["text", "password", "number"],
    },
    status: {
      control: { type: "select" },
      options: ["default", "error", "success"],
    },
    withIcon: { control: false },
    helperMessages: { control: "object" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    onIconClick: { action: "iconClicked" },
    onValueChange: { action: "valueChanged" },
    label: { control: "text" },
  },
  args: {
    type: "text",
    placeholder: "입력하세요",
    disabled: false,
    status: "default",
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Default: Story = {};

export const Types: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12, minWidth: 320 }}>
      <TextInput {...args} type="text" placeholder="text" />
      <TextInput {...args} type="password" placeholder="password" />
      <TextInput {...args} type="number" placeholder="number" />
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    withIcon: SearchIcon,
    placeholder: "Search",
  },
};

export const ErrorState: Story = {
  args: {
    status: "error",
    withIcon: SearchIcon,
    helperMessages: ["필수 입력 항목입니다."],
    placeholder: "오류 상태",
  },
};

export const SuccessState: Story = {
  args: {
    status: "success",
    withIcon: SearchIcon,
    placeholder: "성공 상태",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "비활성화",
  },
};
