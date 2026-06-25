import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PreferenceSection from "./PreferenceSection";

const moodOptions = [
  {
    label: "설레는",
    value: "excited",
    iconPath: "/images/wine-preferences/excited.svg",
  },
  {
    label: "편안한",
    value: "relaxed",
    iconPath: "/images/wine-preferences/relaxed.svg",
  },
  {
    label: "활기찬",
    value: "energetic",
    iconPath: "/images/wine-preferences/energetic.svg",
  },
  {
    label: "로맨틱한",
    value: "romantic",
    iconPath: "/images/wine-preferences/romantic.svg",
  },
  {
    label: "즐거운",
    value: "joyful",
    iconPath: "/images/wine-preferences/joyful.svg",
  },
  {
    label: "차분한",
    value: "calm",
    iconPath: "/images/wine-preferences/calm.svg",
  },
];

const meta: Meta<typeof PreferenceSection> = {
  title: "Feature/wine-preference-select/PreferenceSection",
  component: PreferenceSection,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: {
      control: "text",
      description: "선택 영역 제목입니다.",
    },
    description: {
      control: "text",
      description: "선택 영역의 보조 설명입니다.",
    },
    name: {
      control: "text",
      description: "native radio group 이름입니다.",
    },
    options: {
      control: "object",
      description: "서버에서 전달받은 label/value/iconPath 선택지입니다.",
    },
    selectedValue: {
      control: "text",
      description: "현재 선택된 option value입니다.",
    },
    onSelect: {
      action: "selected",
      description: "option value 선택 핸들러입니다.",
    },
    selectedTone: {
      control: "select",
      options: ["purple", "blue"],
    },
    className: { control: "text" },
  },
  args: {
    title: "오늘의 기분",
    name: "mood-story",
    options: moodOptions,
    selectedValue: null,
    selectedTone: "purple",
  },
  render: (args) => (
    <div className="w-[320px] bg-background-03 p-5">
      <PreferenceSection {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof PreferenceSection>;

export const Default: Story = {};

export const Interactive: Story = {
  render: (args) => {
    const InteractiveSection = () => {
      const [selectedValue, setSelectedValue] = useState<string | null>(null);

      return (
        <div className="w-[320px] bg-background-03 p-5">
          <PreferenceSection
            {...args}
            selectedValue={selectedValue}
            onSelect={(value) => {
              args.onSelect?.(value);
              setSelectedValue(value);
            }}
          />
        </div>
      );
    };

    return <InteractiveSection />;
  },
};

export const AlcoholOptions: Story = {
  args: {
    title: "도수 추천",
    name: "alcohol-story",
    options: [
      { label: "낮음 (8–11%)", value: "low" },
      { label: "중간 (12–13%)", value: "medium" },
      { label: "높음 (14%+)", value: "high" },
      { label: "상관없음", value: "any" },
    ],
    selectedValue: "low",
  },
};

export const Empty: Story = {
  args: {
    options: [],
  },
};
