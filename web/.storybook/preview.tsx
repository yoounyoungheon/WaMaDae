import "../src/app/globals.css";
import { useState, type ReactNode } from "react";
import type { Preview } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "../src/app/shared/api/query-client";
import { WineListSelectionProvider } from "../src/app/feature/wine-list-select/model/wine-list-selection-provider";

/**
 * Story마다 QueryClient와 선택 store 인스턴스를 분리해 상태 누수를 방지한다.
 */
function StoryBoundary({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <WineListSelectionProvider>{children}</WineListSelectionProvider>
    </QueryClientProvider>
  );
}

const preview: Preview = {
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <StoryBoundary>
        <Story />
      </StoryBoundary>
    ),
  ],
};

export default preview;
