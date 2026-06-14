import { SelectItem } from "../../shadcn/select";
import { cn } from "@/app/utils/style/helper";

export interface FormSelectItemProps {
  value: string;
  placeholder: string;
  onSelect?: () => void;
}

export function FormSelectItem({ value, placeholder, onSelect }: FormSelectItemProps) {
  return (
    <SelectItem
      className={cn(
        "flex cursor-default items-center justify-start px-2.5 py-2.5 text-base",
        "text-gray-700 data-[state=checked]:bg-gray-200 hover:bg-gray-100",
      )}
      value={value}
      onClick={onSelect}
    >
      <span className="truncate whitespace-nowrap">{placeholder}</span>
    </SelectItem>
  );
}
