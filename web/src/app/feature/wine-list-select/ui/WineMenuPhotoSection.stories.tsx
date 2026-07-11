import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { type ComponentProps, useEffect, useState } from "react";
import { expect, within } from "storybook/test";
import WineMenuPhotoSection from "./WineMenuPhotoSection";

const meta: Meta<typeof WineMenuPhotoSection> = {
  title: "Feature/wine-list/WineMenuPhotoSection",
  component: WineMenuPhotoSection,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "사진 업로드 박스와 분석 버튼의 펼침 여부입니다.",
    },
    image: {
      control: "object",
      description: "첨부된 메뉴판 이미지 표시 정보입니다.",
    },
    isAnalyzing: {
      control: "boolean",
      description: "와인 리스트 분석 요청 진행 상태입니다.",
    },
    errorMessage: {
      control: "text",
      description: "이미지 검증 또는 분석 실패 시 표시할 메시지입니다.",
    },
    onOpenChange: {
      action: "openChanged",
      description: "접기/다시 보기 버튼 클릭 시 다음 펼침 상태를 전달합니다.",
    },
    onImageChange: {
      action: "imageChanged",
      description: "사용자가 이미지를 선택했을 때 호출됩니다.",
    },
    onAnalyze: {
      action: "analyzeClicked",
      description: "와인 리스트 분석 버튼 클릭 핸들러입니다.",
    },
    className: {
      control: "text",
      description: "섹션 wrapper에 추가할 className입니다.",
    },
  },
  args: {
    isOpen: true,
    image: null,
    isAnalyzing: false,
  },
  render: (args) => <StatefulWineMenuPhotoSection {...args} />,
};

export default meta;

type Story = StoryObj<typeof WineMenuPhotoSection>;

function StatefulWineMenuPhotoSection(
  args: ComponentProps<typeof WineMenuPhotoSection>
) {
  const [isOpen, setIsOpen] = useState(args.isOpen);

  useEffect(() => {
    setIsOpen(args.isOpen);
  }, [args.isOpen]);

  return (
    <div className="w-[304px] bg-background-03">
      <WineMenuPhotoSection
        {...args}
        isOpen={isOpen}
        onOpenChange={(nextIsOpen) => {
          args.onOpenChange?.(nextIsOpen);
          setIsOpen(nextIsOpen);
        }}
      />
    </div>
  );
}

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
};

export const Collapsed: Story = {
  args: {
    isOpen: false,
    image: {
      fileName: "wine-menu-photo.jpg",
    },
  },
};

export const Analyzing: Story = {
  args: {
    image: {
      fileName: "wine-menu-preview.jpg",
      previewUrl: "/ExampleImage.png",
    },
    isAnalyzing: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("status", { name: "와인 메뉴판 분석 중" })
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "분석 중" })
    ).toHaveAttribute("aria-busy", "true");
  },
};

export const Error: Story = {
  args: {
    image: {
      fileName: "wine-menu-photo.jpg",
    },
    errorMessage: "와인 리스트 분석에 실패했습니다.",
  },
};
