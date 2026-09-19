import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PhotoPicker, { type PhotoPickerPreview } from "./photo-picker";

const previews: PhotoPickerPreview[] = [
  {
    id: "1",
    fileName: "menu-front.png",
    previewUrl: "/images/wines/wine-red.png",
  },
  {
    id: "2",
    fileName: "menu-back.png",
    previewUrl: "/images/wines/wine-white.png",
  },
];

const meta: Meta<typeof PhotoPicker> = {
  title: "Components/PhotoPicker",
  component: PhotoPicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    previews: { control: "object" },
    accept: { control: "text" },
    maxCount: { control: "number" },
    disabled: { control: "boolean" },
    isLoading: { control: "boolean" },
    emptyLabel: { control: "text" },
    emptyHint: { control: "text" },
    onAddFiles: { action: "add-files", control: false },
    onRemoveFile: { action: "remove-file", control: false },
  },
  args: {
    previews: [],
    accept: "image/png,image/jpeg",
    maxCount: 5,
    disabled: false,
    isLoading: false,
    emptyLabel: "사진 올리기",
    emptyHint: "사진을 선택하거나 이곳에 올려주세요",
  },
  render: (args) => (
    <div className="w-[340px] max-w-full bg-background-03 p-4">
      <PhotoPicker {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof PhotoPicker>;

export const Default: Story = {};

export const WithPreviews: Story = {
  args: { previews },
};

export const LimitReached: Story = {
  args: {
    maxCount: 2,
    previews,
  },
};

export const Loading: Story = {
  args: { previews, isLoading: true },
};

export const Disabled: Story = {
  args: { previews, disabled: true },
};
