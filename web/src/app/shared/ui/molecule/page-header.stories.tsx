import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PageHeader from "./page-header";

const meta: Meta<typeof PageHeader> = {
  title: "Components/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: {
      control: "text",
      description: "헤더 제목입니다.",
    },
    routeBackPath: {
      control: "text",
      description:
        "뒤로가기 링크의 이동 경로입니다. 값이 없으면 뒤로가기 아이콘을 표시하지 않습니다.",
    },
    className: {
      control: "text",
      description: "헤더 wrapper에 추가할 className입니다.",
    },
  },
  args: {
    title: "와인 리스트 선택",
    routeBackPath: "/",
  },
  render: (args) => (
    <div className="w-[350px] bg-white">
      <PageHeader {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {};

export const WithoutBackLink: Story = {
  args: {
    routeBackPath: undefined,
  },
};

export const LongTitle: Story = {
  args: {
    title: "와인 리스트 선택 화면의 아주 긴 제목",
  },
};
