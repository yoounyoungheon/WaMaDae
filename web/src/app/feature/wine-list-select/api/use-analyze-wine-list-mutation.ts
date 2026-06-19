"use client";

import { useMutation } from "@tanstack/react-query";
import { analyzeWineList } from "@/app/entity/wine/api/wine.api";

export function useAnalyzeWineListMutation() {
  return useMutation({
    mutationFn: (menuImage: File) => analyzeWineList(menuImage),
  });
}
