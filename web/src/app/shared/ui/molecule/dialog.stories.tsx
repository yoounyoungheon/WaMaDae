import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import Button from "../atom/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "./dialog";

const meta: Meta<typeof DialogContent> = {
  title: "Components/Dialog",
  component: DialogContent,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    className: { control: "text" },
  },
  args: {
    title: "Dialog title",
    description: "설명 텍스트가 들어갑니다.",
  },
};

export default meta;

type Story = StoryObj<typeof DialogContent>;

export const Default: Story = {
  render: (args) => {
    const { defaultOpen, ...contentArgs } = args as typeof args & {
      defaultOpen?: boolean;
    };
    return (
      <Dialog defaultOpen={defaultOpen}>
        <DialogTrigger asChild>
          <Button type="primary" variant="solid">
            Open Dialog
          </Button>
        </DialogTrigger>
        <DialogContent {...contentArgs}>
          <div className="space-y-3">
            <p className="text-sm text-text-02">
              다이얼로그 콘텐츠 영역입니다. 필요한 내용을 자유롭게 배치하세요.
            </p>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="cancel" variant="text">
                  취소
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="primary" variant="solid">
                  확인
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
};

export const Opened: Story = {
  args: {
    title: "기본 열림 상태",
    description: "Storybook에서 열려있는 상태로 확인할 수 있습니다.",
  },
  render: Default.render,
};
