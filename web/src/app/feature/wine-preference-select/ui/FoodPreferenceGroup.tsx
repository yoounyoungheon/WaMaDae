import ChoiceChip from "@/app/shared/ui/atom/choice-chip";
import { cn } from "@/app/utils/style/helper";
import type { FoodPreferenceGroupProps } from "./wine-preference-select.props";

export default function FoodPreferenceGroup({
  group,
  selectedValues,
  onToggle,
  className,
}: FoodPreferenceGroupProps) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="text-[11px] font-semibold leading-none text-text-02">
        {group.label}
      </legend>

      {group.options.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {group.options.map((option) => (
            <ChoiceChip
              key={option.value}
              inputType="checkbox"
              name={`pairing-food-${group.value}`}
              value={option.value}
              checked={selectedValues.includes(option.value)}
              onChange={() => onToggle(option.value)}
              iconPath={option.iconPath}
            >
              {option.label}
            </ChoiceChip>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[12px] font-medium text-text-03">
          선택 가능한 항목이 없습니다.
        </p>
      )}
    </fieldset>
  );
}
