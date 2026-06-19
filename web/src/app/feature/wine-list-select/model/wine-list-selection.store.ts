import { createStore } from "zustand/vanilla";
import type { WineId } from "@/app/entity/wine/model/wine.type";

export type WineListSelectionState = {
  selectedWineIds: WineId[];
  addWineId: (wineId: WineId) => void;
  replaceWineIds: (wineIds: WineId[]) => void;
  removeWineId: (wineId: WineId) => void;
  reset: () => void;
};

export type WineListSelectionStore = ReturnType<
  typeof createWineListSelectionStore
>;

export function createWineListSelectionStore(
  initialSelectedWineIds: WineId[] = []
) {
  return createStore<WineListSelectionState>((set) => ({
    selectedWineIds: [...new Set(initialSelectedWineIds)],
    addWineId: (wineId) =>
      set((state) =>
        state.selectedWineIds.includes(wineId)
          ? state
          : { selectedWineIds: [...state.selectedWineIds, wineId] }
      ),
    replaceWineIds: (wineIds) =>
      set({ selectedWineIds: [...new Set(wineIds)] }),
    removeWineId: (wineId) =>
      set((state) => ({
        selectedWineIds: state.selectedWineIds.filter((id) => id !== wineId),
      })),
    reset: () => set({ selectedWineIds: [] }),
  }));
}
