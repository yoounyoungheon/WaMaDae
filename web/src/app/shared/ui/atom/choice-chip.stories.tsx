import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import ChoiceChip from "./choice-chip";

const meta: Meta<typeof ChoiceChip> = {
  title: "Components/ChoiceChip",
  component: ChoiceChip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    inputType: {
      control: "select",
      options: ["radio", "checkbox"],
    },
    name: { control: "text" },
    value: { control: "text" },
    checked: { control: "boolean" },
    onChange: { action: "changed" },
    children: { control: "text" },
    iconPath: {
      control: "text",
      description: "label 앞에 표시할 선택적 장식 아이콘 경로입니다.",
    },
    selectedTone: {
      control: "select",
      options: ["purple", "blue"],
    },
    disabled: { control: "boolean" },
    className: { control: "text" },
  },
  args: {
    inputType: "checkbox",
    value: "excited",
    checked: false,
    children: "설레는",
    selectedTone: "purple",
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof ChoiceChip>;

export const Default: Story = {};

export const SelectedPurple: Story = {
  args: {
    checked: true,
  },
};

export const SelectedBlue: Story = {
  args: {
    checked: true,
    selectedTone: "blue",
    children: "낮음 (8–11%)",
  },
};

export const WithIcon: Story = {
  args: {
    iconPath: "/images/wine-preferences/excited.svg",
  },
};

export const Interactive: Story = {
  render: (args) => {
    const InteractiveChip = () => {
      const [checked, setChecked] = useState(false);

      return (
        <ChoiceChip
          {...args}
          checked={checked}
          onChange={() => setChecked((previous) => !previous)}
        />
      );
    };

    return <InteractiveChip />;
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const FocusVisible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    canvas.getByRole("checkbox").focus();
  },
};

export const LongLabel: Story = {
  args: {
    children: "향신료가 풍부하게 들어간 아주 긴 이름의 음식",
  },
};
