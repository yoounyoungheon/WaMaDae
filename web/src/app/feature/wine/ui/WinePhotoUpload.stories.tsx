import type { Meta, StoryObj } from "@storybook/nextjs";
import WinePhotoUpload from "./WinePhotoUpload";

const meta: Meta<typeof WinePhotoUpload> = {
  title: "Feature/wine/WinePhotoUpload",
  component: WinePhotoUpload,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    buttonLabel: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    className: { control: "text" },
    buttonDisabled: { control: "boolean" },
    onButtonClick: { action: "buttonClicked" },
    onImageChange: { action: "imageChanged" },
  },
  args: {
    buttonLabel: "이미지 분석",
    title: "와인 메뉴 사진 업로드",
    description: "카드를 눌러 와인 사진 1장을 선택하세요.",
    buttonDisabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof WinePhotoUpload>;

export const Default: Story = {};

export const DisabledButton: Story = {
  args: {
    buttonDisabled: true,
    buttonLabel: "업로드 후 진행",
  },
};
