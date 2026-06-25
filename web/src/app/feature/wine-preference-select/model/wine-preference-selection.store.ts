import { createStore } from "zustand/vanilla";
import type { PreferenceValue } from "@/app/entity/wine-preference/model/wine-preference.type";

export type WinePreferenceSelectionState = {
  moodValue: PreferenceValue | null;
  alcoholValue: PreferenceValue | null;
  selectedPairingFoodValues: PreferenceValue[];
  selectMood: (value: PreferenceValue) => void;
  selectAlcohol: (value: PreferenceValue) => void;
  togglePairingFood: (value: PreferenceValue) => void;
  reset: () => void;
};

export type WinePreferenceSelectionStore = ReturnType<
  typeof createWinePreferenceSelectionStore
>;

export type WinePreferenceSelectionInitialState = Pick<
  WinePreferenceSelectionState,
  "moodValue" | "alcoholValue" | "selectedPairingFoodValues"
>;

const defaultInitialState: WinePreferenceSelectionInitialState = {
  moodValue: null,
  alcoholValue: null,
  selectedPairingFoodValues: [],
};

export function createWinePreferenceSelectionStore(
  initialState: Partial<WinePreferenceSelectionInitialState> = {}
) {
  const resolvedInitialState = {
    ...defaultInitialState,
    ...initialState,
    selectedPairingFoodValues: [
      ...new Set(
        initialState.selectedPairingFoodValues ??
          defaultInitialState.selectedPairingFoodValues
      ),
    ],
  };

  return createStore<WinePreferenceSelectionState>((set) => ({
    ...resolvedInitialState,
    selectMood: (value) => set({ moodValue: value }),
    selectAlcohol: (value) => set({ alcoholValue: value }),
    togglePairingFood: (value) =>
      set((state) => ({
        selectedPairingFoodValues: state.selectedPairingFoodValues.includes(
          value
        )
          ? state.selectedPairingFoodValues.filter((item) => item !== value)
          : [...state.selectedPairingFoodValues, value],
      })),
    reset: () => set(defaultInitialState),
  }));
}
