import type { Meta, StoryObj } from "@storybook/nextjs";
import type { SVGProps } from "react";
import HomeIntroCard from "./HomeIntroCard";

function WineGlassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 3h10v2c0 3-2.2 5.6-5 6-2.8-.4-5-3-5-6V3Z" />
      <path d="M12 11v6" />
      <path d="M9 21h6" />
      <path d="M10 17h4" />
      <path d="M8 6c1.2.7 2.5 1 4 1s2.8-.3 4-1" />
    </svg>
  );
}

const meta: Meta<typeof HomeIntroCard> = {
  title: "Feature/home/HomeIntroCard",
  component: HomeIntroCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    userName: { control: "text" },
    actionHref: { control: "text" },
    actionButtonLabel: { control: "text" },
    className: { control: "text" },
    actionIcon: {
      control: false,
      description: "아이콘 버튼에 렌더링할 ReactNode",
    },
  },
  args: {
    userName: "userName",
    actionHref: "/chat",
    actionButtonLabel: "음식과 어울리는 와인 추천받기",
    actionIcon: <WineGlassIcon className="h-4 w-4" />,
  },
};

export default meta;

type Story = StoryObj<typeof HomeIntroCard>;

export const Default: Story = {};

export const LongUserName: Story = {
  args: {
    userName: "오늘도와인고민중인유저",
  },
};
