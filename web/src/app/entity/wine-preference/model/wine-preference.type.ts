export type PreferenceValue = string;

export type PreferenceOptionDto = {
  label: string;
  value: string;
  iconPath?: string;
};

export type PairingFoodCategoryDto = {
  label: string;
  value: string;
  options: PreferenceOptionDto[];
};

export type GetWinePreferenceOptionsResponseDto = {
  data: {
    mood: PreferenceOptionDto[];
    alcohol: PreferenceOptionDto[];
    pairingFood: PairingFoodCategoryDto[];
  };
};

export type WinePreferenceOption = {
  label: string;
  value: PreferenceValue;
  iconPath?: string;
};

export type PairingFoodGroup = {
  label: string;
  value: PreferenceValue;
  options: WinePreferenceOption[];
};

export type WinePreferenceOptions = {
  mood: WinePreferenceOption[];
  alcohol: WinePreferenceOption[];
  pairingFood: PairingFoodGroup[];
};
