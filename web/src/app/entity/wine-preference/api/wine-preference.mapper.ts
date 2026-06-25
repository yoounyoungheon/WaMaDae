import type {
  GetWinePreferenceOptionsResponseDto,
  WinePreferenceOptions,
} from "../model/wine-preference.type";

export function mapWinePreferenceOptionsDto(
  response: GetWinePreferenceOptionsResponseDto
): WinePreferenceOptions {
  return {
    mood: response.data.mood.map((option) => ({ ...option })),
    alcohol: response.data.alcohol.map((option) => ({ ...option })),
    pairingFood: response.data.pairingFood.map((group) => ({
      label: group.label,
      value: group.value,
      options: group.options.map((option) => ({ ...option })),
    })),
  };
}
