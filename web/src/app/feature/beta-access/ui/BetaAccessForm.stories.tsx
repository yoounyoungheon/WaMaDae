import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { BetaAccessFormView } from "./BetaAccessForm";

const meta = {
  title: "Feature/beta-access/BetaAccessForm",
  component: BetaAccessFormView,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[640px] w-[390px] max-w-full items-center bg-violet-haze px-5">
        <Story />
      </div>
    ),
  ],
  args: {
    code: "",
    errorMessage: null,
    isSubmitting: false,
    onCodeChange: fn(),
    onSubmit: fn((event) => event.preventDefault()),
  },
} satisfies Meta<typeof BetaAccessFormView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Submitting: Story = {
  args: {
    code: "beta-access-code",
    isSubmitting: true,
  },
};

export const InvalidCode: Story = {
  args: {
    code: "wrong-code",
    errorMessage: "유효하지 않은 접근 코드입니다.",
  },
};

export const ServerError: Story = {
  args: {
    code: "beta-access-code",
    errorMessage: "인증을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  },
};
