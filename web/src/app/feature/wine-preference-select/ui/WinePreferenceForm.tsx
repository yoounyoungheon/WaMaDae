"use client";

import type { WinePreferenceOptions } from "@/app/entity/wine-preference/model/wine-preference.type";
import { cn } from "@/app/utils/style/helper";
import { useWinePreferenceSelectController } from "../model/use-wine-preference-select-controller";
import FoodPreferenceGroup from "./FoodPreferenceGroup";
import PreferenceSection from "./PreferenceSection";

interface WinePreferenceFormProps {
  options: WinePreferenceOptions;
  className?: string;
}

export default function WinePreferenceForm({
  options,
  className,
}: WinePreferenceFormProps) {
  const {
    moodValue,
    alcoholValue,
    selectedPairingFoodValues,
    selectMood,
    selectAlcohol,
    togglePairingFood,
  } = useWinePreferenceSelectController(options);

  return (
    <div className={cn("min-w-0", className)}>
      <PreferenceSection
        title="오늘의 기분"
        name="mood"
        options={options.mood}
        selectedValue={moodValue}
        onSelect={selectMood}
      />

      <PreferenceSection
        className="mt-7"
        title="도수 추천"
        name="alcohol"
        options={options.alcohol}
        selectedValue={alcoholValue}
        onSelect={selectAlcohol}
      />

      <fieldset className="mt-7 min-w-0">
        <legend className="text-[13px] font-bold leading-none text-text-02">
          함께 먹는 음식
        </legend>
        <p className="mt-2 text-[11px] font-medium leading-normal text-text-03">
          구체적으로 선택할수록 정확한 추천을 받을 수 있어요
        </p>

        {options.pairingFood.length > 0 ? (
          <div className="mt-3 flex flex-col gap-5">
            {options.pairingFood.map((group) => (
              <FoodPreferenceGroup
                key={group.value}
                group={group}
                selectedValues={selectedPairingFoodValues}
                onToggle={togglePairingFood}
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-[12px] font-medium text-text-03">
            선택 가능한 항목이 없습니다.
          </p>
        )}
      </fieldset>
    </div>
  );
}
