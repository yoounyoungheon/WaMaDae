import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className={`w-[360px] ${args.className ?? ""}`.trim()}>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>짧은 설명 텍스트</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">
          본문 영역입니다. 카드 내부 콘텐츠를 자유롭게 배치할 수 있습니다.
        </p>
      </CardContent>
      <CardFooter>
        <span className="text-xs textㄴslate-500">Footer 영역</span>
      </CardFooter>
    </Card>
  ),
};

export const ContentOnly: Story = {
  render: (args) => (
    <Card {...args} className={`w-[360px] ${args.className ?? ""}`.trim()}>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            헤더 없이 콘텐츠만 사용하는 예시입니다.
          </p>
          <p className="text-sm text-slate-600">
            필요한 레이아웃에 맞춰 구성 요소를 조합하세요.
          </p>
        </div>
      </CardContent>
    </Card>
  ),
};

export const WithFooterActions: Story = {
  render: (args) => (
    <Card {...args} className={`w-[360px] ${args.className ?? ""}`.trim()}>
      <CardHeader>
        <CardTitle>액션 포함 카드</CardTitle>
        <CardDescription>Footer에 액션을 배치한 예시입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">간단한 설명 텍스트.</p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <button className="text-xs text-slate-500">취소</button>
        <button className="text-xs font-semibold text-blue-600">확인</button>
      </CardFooter>
    </Card>
  ),
};
