import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import PhotoUploadBox from "./PhotoUploadBox";

const meta: Meta<typeof PhotoUploadBox> = {
  title: "Feature/wine-list/PhotoUploadBox",
  component: PhotoUploadBox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    image: {
      control: "object",
      description: "첨부된 메뉴판 이미지의 표시 정보입니다.",
    },
    accept: {
      control: "text",
      description: "file input에서 허용할 파일 형식입니다.",
    },
    disabled: {
      control: "boolean",
      description: "파일 선택 가능 여부입니다.",
    },
    isLoading: {
      control: "boolean",
      description: "사진 영역 위에 분석 진행 상태를 표시합니다.",
    },
    onFileChange: {
      action: "fileChanged",
      description: "사용자가 파일을 선택했을 때 호출됩니다.",
    },
    className: {
      control: "text",
      description: "업로드 박스 wrapper에 추가할 className입니다.",
    },
  },
  args: {
    image: null,
    accept: "image/jpeg,image/png",
    disabled: false,
    isLoading: false,
  },
  render: (args) => (
    <div className="w-[304px] bg-background-03">
      <PhotoUploadBox {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof PhotoUploadBox>;

export const Default: Story = {};

export const WithImageName: Story = {
  args: {
    image: {
      fileName: "wine-menu-photo.jpg",
    },
  },
};

export const WithPreview: Story = {
  args: {
    image: {
      fileName: "wine-menu-preview.jpg",
      previewUrl: "/ExampleImage.png",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: {
    image: {
      fileName: "wine-menu-preview.jpg",
      previewUrl: "/ExampleImage.png",
    },
    isLoading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status", {
      name: "와인 메뉴판 분석 중",
    });
    const animatedSkeleton = status.querySelector(".animate-pulse");
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[type="file"]'
    );

    await expect(status).toBeVisible();
    await expect(animatedSkeleton).toBeInTheDocument();
    await expect(input).toBeDisabled();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
