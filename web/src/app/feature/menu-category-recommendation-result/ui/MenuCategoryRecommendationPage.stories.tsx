import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  clearMenuCategoryRecommendationRequest,
  saveMenuCategoryRecommendationRequest,
} from "@/app/entity/menu-category-recommendation/lib/recommendation-request-storage";
import type { MenuCategoryRecommendationRequest } from "@/app/entity/menu-category-recommendation/model/menu-category-recommendation.type";
import MenuCategoryRecommendationPage from "./MenuCategoryRecommendationPage";

const sampleRequest: MenuCategoryRecommendationRequest = {
  wineIds: [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
  ],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Story별로 선택 스냅샷(sessionStorage)과 /api 응답을 함께 스텁한다.
 * cleanup으로 sessionStorage와 fetch를 복원해 상태 누수를 막는다.
 */
function stubStoryEnv(options: {
  request?: MenuCategoryRecommendationRequest;
  fetchHandler?: () => Promise<Response>;
}) {
  return async () => {
    const originalFetch = globalThis.fetch;

    clearMenuCategoryRecommendationRequest();
    if (options.request) {
      saveMenuCategoryRecommendationRequest(options.request);
    }
    if (options.fetchHandler) {
      globalThis.fetch = (() => options.fetchHandler!()) as typeof fetch;
    }

    return () => {
      globalThis.fetch = originalFetch;
      clearMenuCategoryRecommendationRequest();
    };
  };
}

/**
 * Story별 QueryClient 인스턴스를 분리해 캐시 누수를 막는다.
 */
const withPageProviders: Decorator = function PageProvidersDecorator(Story) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-[720px] w-[360px] flex-col overflow-hidden bg-background-03">
        <Story />
      </div>
    </QueryClientProvider>
  );
};

const meta: Meta<typeof MenuCategoryRecommendationPage> = {
  title:
    "Feature/menu-category-recommendation-result/MenuCategoryRecommendationPage",
  component: MenuCategoryRecommendationPage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [withPageProviders],
};

export default meta;

type Story = StoryObj<typeof MenuCategoryRecommendationPage>;

export const Succeeded: Story = {
  beforeEach: stubStoryEnv({
    request: sampleRequest,
    fetchHandler: async () =>
      jsonResponse({ categories: ["소고기 스테이크", "숙성 치즈", "해산물"] }),
  }),
};

export const Loading: Story = {
  beforeEach: stubStoryEnv({
    request: sampleRequest,
    fetchHandler: () => new Promise<Response>(() => {}),
  }),
};

export const EmptyResult: Story = {
  beforeEach: stubStoryEnv({
    request: sampleRequest,
    fetchHandler: async () => jsonResponse({ categories: [] }),
  }),
};

export const Error: Story = {
  beforeEach: stubStoryEnv({
    request: sampleRequest,
    fetchHandler: async () =>
      jsonResponse({ message: "추천 메뉴를 불러오지 못했습니다." }, 502),
  }),
};

export const NoSelection: Story = {
  beforeEach: stubStoryEnv({}),
};
