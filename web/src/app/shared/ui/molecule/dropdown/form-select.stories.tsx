import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import FormSelect from "./form-select-index";

const meta: Meta<typeof FormSelect> = {
  title: "Components/FormSelect",
  component: FormSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    placeholder: { control: "text" },
    defaultValue: { control: "text" },
    name: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    error: { control: "boolean" },
    errorMessages: { control: "object" },
    onValueChange: { action: "valueChange" },
  },
  args: {
    placeholder: "과목을 선택하세요",
    name: "subject",
    disabled: false,
    required: false,
    error: false,
    errorMessages: ["선택된 값이 없습니다."],
  },
};

export default meta;

type Story = StoryObj<typeof FormSelect>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[320px]">
      <FormSelect {...args}>
        <FormSelect.Item value="korean" placeholder="국어" />
        <FormSelect.Item value="math" placeholder="수학" />
        <FormSelect.Item value="english" placeholder="영어" />
        <FormSelect.Item value="science" placeholder="과학" />
      </FormSelect>
    </div>
  ),
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: "math",
  },
  render: Default.render,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: Default.render,
};

export const ErrorState: Story = {
  args: {
    error: true,
    errorMessages: ["과목을 선택해주세요."],
  },
  render: Default.render,
};
