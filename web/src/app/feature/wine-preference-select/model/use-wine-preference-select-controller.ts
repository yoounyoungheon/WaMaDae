"use client";

import type { WinePreferenceOptions } from "@/app/entity/wine-preference/model/wine-preference.type";
import { useWinePreferenceSelectionStore } from "./wine-preference-selection-provider";

export function useWinePreferenceSelectController(
  options: WinePreferenceOptions
) {
  const moodValue = useWinePreferenceSelectionStore(
    (state) => state.moodValue
  );
  const alcoholValue = useWinePreferenceSelectionStore(
    (state) => state.alcoholValue
  );
  const selectedPairingFoodValues = useWinePreferenceSelectionStore(
    (state) => state.selectedPairingFoodValues
  );
  const selectMood = useWinePreferenceSelectionStore(
    (state) => state.selectMood
  );
  const selectAlcohol = useWinePreferenceSelectionStore(
    (state) => state.selectAlcohol
  );
  const togglePairingFood = useWinePreferenceSelectionStore(
    (state) => state.togglePairingFood
  );

  const hasValidMood = options.mood.some(
    (option) => option.value === moodValue
  );
  const hasValidAlcohol = options.alcohol.some(
    (option) => option.value === alcoholValue
  );
  const pairingFoodValues = new Set(
    options.pairingFood.flatMap((group) =>
      group.options.map((option) => option.value)
    )
  );
  const hasValidPairingFood = selectedPairingFoodValues.some((value) =>
    pairingFoodValues.has(value)
  );

  return {
    moodValue,
    alcoholValue,
    selectedPairingFoodValues,
    selectMood,
    selectAlcohol,
    togglePairingFood,
    isCompleteEnabled:
      hasValidMood && hasValidAlcohol && hasValidPairingFood,
  };
}
