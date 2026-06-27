import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WineRecommendationChatDialog from "./WineRecommendationChatDialog";
import { wineRecommendationResultFixture } from "./wine-recommendation-result.fixture";

const meta: Meta<typeof WineRecommendationChatDialog> = {
  title: "Feature/wine-recommendation-result/WineRecommendationChatDialog",
  component: WineRecommendationChatDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    open: {
      control: "boolean",
    },
    inputValue: {
      control: "text",
    },
    selectedQuestionLabel: {
      control: "text",
    },
    chat: {
      control: "object",
    },
    onOpenChange: {
      action: "open changed",
    },
    onInputChange: {
      action: "input changed",
    },
    onSubmit: {
      action: "submit",
    },
  },
  args: {
    open: true,
    inputValue: "",
    chat: wineRecommendationResultFixture.chat,
    selectedQuestionLabel: undefined,
  },
  decorators: [
    (Story) => (
      <div className="relative h-[715px] w-[390px] overflow-hidden bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof WineRecommendationChatDialog>;

export const OpenEmpty: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(args.open);
    const [value, setValue] = useState(args.inputValue);

    return (
      <WineRecommendationChatDialog
        {...args}
        open={open}
        inputValue={value}
        onOpenChange={setOpen}
        onInputChange={setValue}
        onSubmit={(message) => console.log(message)}
      />
    );
  },
};

export const OpenWithQuestion: Story = {
  args: {
    inputValue: "이 와인과 어울리는 음식은?",
    selectedQuestionLabel: "이 와인과 어울리는 음식은?",
  },
  render: OpenEmpty.render,
};
