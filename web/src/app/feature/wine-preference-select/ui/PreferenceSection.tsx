import ChoiceChip from "@/app/shared/ui/atom/choice-chip";
import { cn } from "@/app/utils/style/helper";
import type { PreferenceSectionProps } from "./wine-preference-select.props";

export default function PreferenceSection({
  title,
  description,
  name,
  options,
  selectedValue,
  onSelect,
  selectedTone = "purple",
  className,
}: PreferenceSectionProps) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="text-[13px] font-bold leading-none text-text-02">
        {title}
      </legend>
      {description ? (
        <p className="mt-2 text-[11px] font-medium leading-normal text-text-03">
          {description}
        </p>
      ) : null}

      {options.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((option) => (
            <ChoiceChip
              key={option.value}
              inputType="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => onSelect(option.value)}
              selectedTone={selectedTone}
              iconPath={option.iconPath}
            >
              {option.label}
            </ChoiceChip>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[12px] font-medium text-text-03">
          선택 가능한 항목이 없습니다.
        </p>
      )}
    </fieldset>
  );
}
