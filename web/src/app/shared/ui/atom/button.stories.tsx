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
      options: ["solid", "outline", "text"],
    },
    type: {
      control: { type: "select" },
      options: ["primary", "error", "cancel"],
    },
    size: {
      control: { type: "select" },
      options: ["default", "icon"],
    },
    radius: {
      control: { type: "select" },
      options: ["sm", "lg", "full"],
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
    variant: "solid",
    type: "primary",
    size: "default",
    radius: "lg",
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
      <Button {...args} variant="solid">
        solid
      </Button>
      <Button {...args} variant="outline">
        outline
      </Button>
      <Button {...args} variant="text">
        text
      </Button>
    </div>
  ),
  args: {
    type: "primary",
    size: "default",
  },
};

export const Types: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button {...args} type="primary">
        primary
      </Button>
      <Button {...args} type="error">
        error
      </Button>
      <Button {...args} type="cancel">
        cancel
      </Button>
    </div>
  ),
  args: {
    variant: "solid",
    size: "default",
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button {...args} size="default">
        default
      </Button>
      <Button {...args} size="icon" aria-label="icon button">
        +
      </Button>
    </div>
  ),
};

export const Radius: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button {...args} radius="sm">
        sm
      </Button>
      <Button {...args} radius="lg">
        lg
      </Button>
      <Button {...args} radius="full">
        full
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
