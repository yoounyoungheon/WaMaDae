import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { RecommendedMenu } from "@/app/entity/menu-category-recommendation/model/menu-category-recommendation.type";
import RecommendedMenuList from "./RecommendedMenuList";

// 같은 category가 그루핑되도록 섞인 순서로 구성한다.
const menus: RecommendedMenu[] = [
  { name: "해산물 파전", category: "해산물" },
  { name: "바지락 오일 파스타", category: "파스타 및 면" },
  { name: "안심 스테이크", category: "붉은 고기" },
  { name: "감바스", category: "해산물" },
  { name: "명란 크림 파스타", category: "파스타 및 면" },
  { name: "부라타 치즈 샐러드", category: "치즈" },
  { name: "가르니 디저트 플레이트", category: "디저트" },
];

const meta: Meta<typeof RecommendedMenuList> = {
  title: "Feature/menu-category-recommendation-result/RecommendedMenuList",
  component: RecommendedMenuList,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    menus: { control: "object" },
    selectedNames: { control: "object" },
    onToggleName: { action: "toggle", control: false },
  },
  args: {
    menus,
    selectedNames: ["바지락 오일 파스타"],
  },
  render: (args) => (
    <div className="w-[390px] max-w-full bg-background-03 p-4">
      <RecommendedMenuList {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof RecommendedMenuList>;

export const Default: Story = {};

export const SingleCategory: Story = {
  args: {
    menus: [
      { name: "해산물 파전", category: "해산물" },
      { name: "감바스", category: "해산물" },
    ],
    selectedNames: [],
  },
};

export const NoneSelected: Story = {
  args: { selectedNames: [] },
};
