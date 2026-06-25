import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import type { WinePreferenceOptions } from "@/app/entity/wine-preference/model/wine-preference.type";
import { WinePreferenceSelectionProvider } from "../model/wine-preference-selection-provider";
import type { WinePreferenceSelectionInitialState } from "../model/wine-preference-selection.store";
import WinePreferenceSelectPage from "./WinePreferenceSelectPage";

const options: WinePreferenceOptions = {
  mood: [
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
  ],
  alcohol: [
    { label: "낮음 (8–11%)", value: "low" },
    { label: "중간 (12–13%)", value: "medium" },
    { label: "높음 (14%+)", value: "high" },
    { label: "상관없음", value: "any" },
  ],
  pairingFood: [
    {
      label: "육류",
      value: "meat",
      options: [
        { label: "소고기 스테이크", value: "beefSteak" },
        { label: "돼지갈비", value: "porkRibs" },
        { label: "양갈비", value: "lambChops" },
        { label: "삼겹살", value: "porkBelly" },
      ],
    },
    {
      label: "해산물",
      value: "seafood",
      options: [
        { label: "생선회", value: "sashimi" },
        { label: "구운 생선", value: "grilledFish" },
        { label: "랍스터/새우", value: "lobsterAndShrimp" },
        { label: "조개찜", value: "steamedShellfish" },
      ],
    },
    {
      label: "치즈",
      value: "cheese",
      options: [
        { label: "숙성 치즈", value: "agedCheese" },
        { label: "블루 치즈", value: "blueCheese" },
        { label: "모짜렐라", value: "mozzarella" },
      ],
    },
    {
      label: "파스타",
      value: "pasta",
      options: [
        { label: "토마토 파스타", value: "tomatoPasta" },
        { label: "크림 파스타", value: "creamPasta" },
        { label: "오일 파스타", value: "oilPasta" },
      ],
    },
  ],
};

function withPreferencePage(
  initialState?: Partial<WinePreferenceSelectionInitialState>
): Decorator {
  return function PreferencePageDecorator(Story) {
    return (
      <WinePreferenceSelectionProvider initialState={initialState}>
        <div className="flex h-[717px] w-[350px] flex-col overflow-hidden bg-background-03">
          <Story />
        </div>
      </WinePreferenceSelectionProvider>
    );
  };
}

const meta: Meta<typeof WinePreferenceSelectPage> = {
  title: "Feature/wine-preference-select/WinePreferenceSelectPage",
  component: WinePreferenceSelectPage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    options: {
      control: "object",
      description: "Server Component가 조회해 전달하는 추천 선택 옵션입니다.",
    },
    className: {
      control: "text",
    },
  },
  args: {
    options,
  },
};

export default meta;

type Story = StoryObj<typeof WinePreferenceSelectPage>;

export const Default: Story = {
  decorators: [withPreferencePage()],
};

export const PartiallySelected: Story = {
  decorators: [
    withPreferencePage({
      moodValue: "excited",
      selectedPairingFoodValues: ["beefSteak"],
    }),
  ],
};

export const ReadyToSubmit: Story = {
  decorators: [
    withPreferencePage({
      moodValue: "excited",
      alcoholValue: "low",
      selectedPairingFoodValues: ["beefSteak", "grilledFish"],
    }),
  ],
};

export const EmptyOptions: Story = {
  args: {
    options: {
      mood: [],
      alcohol: [],
      pairingFood: [],
    },
  },
  decorators: [withPreferencePage()],
};

export const LongFoodOptions: Story = {
  args: {
    options: {
      ...options,
      pairingFood: [
        ...options.pairingFood,
        {
          label: "디저트와 간식",
          value: "dessert",
          options: [
            {
              label: "진한 다크초콜릿과 견과류가 들어간 디저트",
              value: "darkChocolateDessert",
            },
            { label: "과일 타르트", value: "fruitTart" },
          ],
        },
      ],
    },
  },
  decorators: [withPreferencePage()],
};
