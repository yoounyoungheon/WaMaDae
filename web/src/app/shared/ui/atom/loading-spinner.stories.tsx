import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import LoadingSpinner from "./loading-spinner";

const meta: Meta<typeof LoadingSpinner> = {
  title: "Components/LoadingSpinner",
  component: LoadingSpinner,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    label: {
      control: "text",
      description: "스크린 리더에 전달할 진행 상태 이름입니다.",
    },
    className: {
      control: "text",
      description: "스피너 크기 등 추가 스타일을 지정합니다.",
    },
  },
  args: {
    label: "로딩 중",
  },
};

export default meta;

type Story = StoryObj<typeof LoadingSpinner>;

export const Primary: Story = {};

export const Large: Story = {
  args: {
    className: "h-10 w-10",
  },
};
