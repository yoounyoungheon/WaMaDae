import type {
  PairingFoodGroup,
  PreferenceValue,
  WinePreferenceOption,
  WinePreferenceOptions,
} from "@/app/entity/wine-preference/model/wine-preference.type";

export interface WinePreferenceSelectPageProps {
  options: WinePreferenceOptions;
  className?: string;
}

export interface PreferenceSectionProps {
  title: string;
  description?: string;
  name: string;
  options: WinePreferenceOption[];
  selectedValue: PreferenceValue | null;
  onSelect: (value: PreferenceValue) => void;
  selectedTone?: "purple" | "blue";
  className?: string;
}

export interface FoodPreferenceGroupProps {
  group: PairingFoodGroup;
  selectedValues: PreferenceValue[];
  onToggle: (value: PreferenceValue) => void;
  className?: string;
}
