import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Decorator } from "@storybook/nextjs-vite";
import { TableKeywordSelectionProvider } from "../model/table-keyword-selection-provider";
import TableKeywordSelectPage from "./TableKeywordSelectPage";
import type { TableKeywordDto } from "@/app/entity/table-keyword/model/table-keyword.type";

const keywordDtos: TableKeywordDto[] = [
  { id: "meat", name: "고기", emojiPath: "/images/table-keywords/meat.svg", display_order: 1 },
  { id: "pizza", name: "피자", emojiPath: "/images/table-keywords/pizza.svg", display_order: 2 },
  { id: "cheese", name: "치즈", emojiPath: "/images/table-keywords/cheese.svg", display_order: 3 },
  { id: "pasta", name: "파스타", emojiPath: "/images/table-keywords/pasta.svg", display_order: 4 },
  { id: "salad", name: "샐러드", emojiPath: "/images/table-keywords/salad.svg", display_order: 5 },
  { id: "sushi", name: "회/초밥", emojiPath: "/images/table-keywords/sushi.svg", display_order: 6 },
  { id: "noodles", name: "면 요리", emojiPath: "/images/table-keywords/noodles.svg", display_order: 7 },
  { id: "stew-soup", name: "찌개/국", emojiPath: "/images/table-keywords/stew-soup.svg", display_order: 8 },
  { id: "dessert", name: "디저트", emojiPath: "/images/table-keywords/dessert.svg", display_order: 9 },
  { id: "burger", name: "햄버거", emojiPath: "/images/table-keywords/burger.svg", display_order: 10 },
  { id: "seafood", name: "해산물", emojiPath: "/images/table-keywords/seafood.svg", display_order: 11 },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Story별로 /api/table-keywords 응답을 스텁한다.
 * cleanup으로 원래 fetch를 복원해 상태 누수를 막는다.
 */
function stubFetch(handler: () => Promise<Response>) {
  return async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => handler()) as typeof fetch;
    return () => {
      globalThis.fetch = originalFetch;
    };
  };
}

/**
 * Story별 QueryClient와 선택 store 인스턴스를 분리해 상태 누수를 방지한다.
 */
function withPageProviders(initialSelectedKeywordIds: string[] = []): Decorator {
  return function PageProvidersDecorator(Story) {
    const [queryClient] = useState(
      () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
    );

    return (
      <QueryClientProvider client={queryClient}>
        <TableKeywordSelectionProvider
          initialSelectedKeywordIds={initialSelectedKeywordIds}
        >
          <div className="flex h-[720px] w-[360px] flex-col overflow-hidden bg-background-03">
            <Story />
          </div>
        </TableKeywordSelectionProvider>
      </QueryClientProvider>
    );
  };
}

const meta: Meta<typeof TableKeywordSelectPage> = {
  title: "Feature/table-keyword-select/TableKeywordSelectPage",
  component: TableKeywordSelectPage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  render: () => <TableKeywordSelectPage />,
};

export default meta;

type Story = StoryObj<typeof TableKeywordSelectPage>;

export const Default: Story = {
  decorators: [withPageProviders()],
  beforeEach: stubFetch(async () => jsonResponse({ keywords: keywordDtos })),
};

export const TwoSelected: Story = {
  decorators: [withPageProviders(["meat", "salad"])],
  beforeEach: stubFetch(async () => jsonResponse({ keywords: keywordDtos })),
};

export const Loading: Story = {
  decorators: [withPageProviders()],
  beforeEach: stubFetch(() => new Promise<Response>(() => {})),
};

export const Error: Story = {
  decorators: [withPageProviders()],
  beforeEach: stubFetch(async () =>
    jsonResponse({ message: "테이블 키워드를 불러오지 못했습니다." }, 500)
  ),
};

export const Empty: Story = {
  decorators: [withPageProviders()],
  beforeEach: stubFetch(async () => jsonResponse({ keywords: [] })),
};
