"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "./shared/api/query-client";
import { WineListSelectionProvider } from "./feature/wine-list-select/model/wine-list-selection-provider";

export default function Providers({ children }: { children: ReactNode }) {
  // QueryClient는 브라우저 생명주기 동안 한 번만 생성한다.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <WineListSelectionProvider>{children}</WineListSelectionProvider>
    </QueryClientProvider>
  );
}
