import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Button from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    type: {
      control: { type: "select" },
      options: ["default", "icon"],
    },
    asChild: {
      control: { type: "boolean" },
      description: "Slot을 사용해 다른 엘리먼트를 버튼 스타일로 감쌉니다.",
    },
    disabled: { control: { type: "boolean" } },
    onClick: { action: "clicked" },
    className: { control: { type: "text" } },
  },
  args: {
    children: "Button",
    variant: "default",
    type: "default",
    disabled: false,
    asChild: false,
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button {...args} variant="default">
        default
      </Button>
      <Button {...args} variant="destructive">
        destructive
      </Button>
      <Button {...args} variant="outline">
        outline
      </Button>
      <Button {...args} variant="secondary">
        secondary
      </Button>
      <Button {...args} variant="ghost">
        ghost
      </Button>
      <Button {...args} variant="link">
        link
      </Button>
    </div>
  ),
  args: {
    type: "default",
  },
};

export const Types: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button {...args} type="default">
        default
      </Button>
      <Button {...args} type="icon" aria-label="icon button">
        +
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

export const AsChildLink: Story = {
  args: {
    asChild: true,
  },
  render: (args) => (
    <Button {...args}>
      <a href="#" onClick={(e) => e.preventDefault()}>
        asChild link
      </a>
    </Button>
  ),
};
