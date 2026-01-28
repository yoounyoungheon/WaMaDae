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
    icon: { control: false },
    error: { control: "boolean" },
    errorMessages: { control: "object" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    onValueChange: { action: "valueChanged" },
  },
  args: {
    type: "text",
    placeholder: "입력하세요",
    disabled: false,
    error: false,
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
    icon: SearchIcon,
    placeholder: "Search",
  },
};

export const ErrorState: Story = {
  args: {
    error: true,
    errorMessages: ["필수 입력 항목입니다."],
    placeholder: "오류 상태",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "비활성화",
  },
};
