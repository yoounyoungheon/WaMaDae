import { createStore } from "zustand/vanilla";
import type { TableKeywordId } from "@/app/entity/table-keyword/model/table-keyword.type";

export type TableKeywordSelectionState = {
  selectedKeywordIds: TableKeywordId[];
  toggleKeyword: (keywordId: TableKeywordId) => void;
  reset: () => void;
};

export type TableKeywordSelectionStore = ReturnType<
  typeof createTableKeywordSelectionStore
>;

export function createTableKeywordSelectionStore(
  initialSelectedKeywordIds: TableKeywordId[] = []
) {
  return createStore<TableKeywordSelectionState>((set) => ({
    selectedKeywordIds: [...new Set(initialSelectedKeywordIds)],
    toggleKeyword: (keywordId) =>
      set((state) => ({
        selectedKeywordIds: state.selectedKeywordIds.includes(keywordId)
          ? state.selectedKeywordIds.filter((id) => id !== keywordId)
          : [...state.selectedKeywordIds, keywordId],
      })),
    reset: () => set({ selectedKeywordIds: [] }),
  }));
}
