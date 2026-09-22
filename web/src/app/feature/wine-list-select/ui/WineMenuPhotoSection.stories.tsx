import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { MenuImagePreview } from "@/app/entity/wine/model/wine.type";
import WineMenuPhotoSection from "./WineMenuPhotoSection";

const previews = [
  {
    id: "1",
    file: new File([], "menu-front.png"),
    fileName: "menu-front.png",
    previewUrl: "/images/wines/wine-red.png",
  },
  {
    id: "2",
    file: new File([], "menu-back.png"),
    fileName: "menu-back.png",
    previewUrl: "/images/wines/wine-white.png",
  },
] satisfies MenuImagePreview[];

const meta: Meta<typeof WineMenuPhotoSection> = {
  title: "Feature/wine-list-select/WineMenuPhotoSection",
  component: WineMenuPhotoSection,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    previews: { control: "object" },
    isAnalyzing: { control: "boolean" },
    imageErrorMessage: { control: "text" },
    extractionErrorMessage: { control: "text" },
    onAddFiles: { action: "add-files", control: false },
    onRemoveFile: { action: "remove-file", control: false },
    onAnalyze: { action: "analyze", control: false },
  },
  args: {
    previews: [],
    isAnalyzing: false,
  },
  render: (args) => (
    <div className="w-[360px] max-w-full bg-background-03 p-4">
      <WineMenuPhotoSection {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof WineMenuPhotoSection>;

export const Empty: Story = {};

export const WithPhotos: Story = {
  args: { previews },
};

export const Analyzing: Story = {
  args: { previews, isAnalyzing: true },
};

export const InvalidFile: Story = {
  args: {
    previews,
    imageErrorMessage: "JPG, PNG 이미지만 첨부할 수 있습니다.",
  },
};

export const ExtractionError: Story = {
  args: {
    previews,
    extractionErrorMessage: "와인 메뉴 이미지 분석에 실패했습니다.",
  },
};
