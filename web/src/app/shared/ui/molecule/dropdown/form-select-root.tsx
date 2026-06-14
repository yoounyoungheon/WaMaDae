import React, { useMemo, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import { cn } from "@/app/utils/style/helper";

export interface FormSelectProps extends React.HTMLAttributes<HTMLInputElement> {
  placeholder: string;
  defaultValue?: string;
  name?: string;
  icon?: React.ElementType;
  error?: boolean;
  errorMessages?: string[];
  disabled?: boolean;
  children?: React.ReactNode;
  required?: boolean;
  onValueChange?: (value: unknown) => void;
  ref?: React.Ref<HTMLInputElement>;
}

type FormSelectItemElement = React.ReactElement<{
  value: string;
  placeholder: string;
}>;

function getFormSelectItems(children: React.ReactNode) {
  return React.Children.toArray(children).filter(
    (child): child is FormSelectItemElement =>
      React.isValidElement(child) &&
      typeof (child as FormSelectItemElement).props.value === "string" &&
      typeof (child as FormSelectItemElement).props.placeholder === "string",
  );
}

export function FormSelectRoot({
  defaultValue,
  icon,
  error = false,
  errorMessages,
  disabled = false,
  name,
  children,
  placeholder,
  id,
  required,
  onValueChange,
  ref,
}: FormSelectProps) {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(defaultValue);
  const listboxButtonRef = useRef<HTMLButtonElement | null>(null);
  const selectItems = useMemo(() => getFormSelectItems(children), [children]);
  const Icon = icon;

  const selectedPlaceholder = useMemo(() => {
    const selectedItem = selectItems.find((child) => child.props.value === selectedValue);
    return selectedItem
      ? selectedItem.props.placeholder
      : placeholder;
  }, [selectedValue, selectItems, placeholder]);

  return (
    <div className="relative w-full text-base">
      <select
        required={required}
        title="select-hidden"
        className={cn("absolute left-0 top-0 z-0 h-full w-full opacity-0")}
        value={selectedValue ?? ""}
        onChange={(e) => {
          e.preventDefault();
          onValueChange?.(e.target.value);
          setSelectedValue(e.target.value);
        }}
        name={name}
        disabled={disabled}
        id={id}
        onFocus={() => {
          const listboxButton = listboxButtonRef.current;
          if (listboxButton) listboxButton.focus();
        }}
      >
        <option className="hidden" value="" hidden>
          {placeholder}
        </option>
        {selectItems.map((child) => {
          const { value, placeholder } = child.props;
          return (
            <option className="hidden" key={value} value={value}>
              {placeholder}
            </option>
          );
        })}
      </select>
      <Select
        value={selectedValue ?? ""}
        onValueChange={(value: string) => {
          onValueChange?.(value);
          setSelectedValue(value);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          ref={listboxButtonRef}
          className={cn(
            "w-full  truncate whitespace-nowrap rounded-xl border py-2 pr-8 text-left outline-none transition duration-100 focus:ring-2",
            "border-gray-800 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-200",
            Icon ? "pl-10" : "pl-3",
          )}
        >
          {Icon && (
            <span className="absolute inset-y-0 left-0 ml-px flex items-center pl-2.5">
              <Icon className={cn("h-5 w-5 flex-none", "text-gray-600")} />
            </span>
          )}
          <SelectValue asChild>
            <span className={cn("block truncate p-0", disabled && "text-gray-6")}>
            {selectedPlaceholder}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          className={cn(
            "z-20 max-h-[228px] w-[var(--radix-select-trigger-width)] divide-y overflow-y-auto rounded-lg border outline-none",
            "divide-gray-200 border-gray-200 bg-white shadow-md",
          )}
          position="popper"
          sideOffset={4}
        >
              {children}
        </SelectContent>
      </Select>
      {error && errorMessages
        ? errorMessages.map((message, index) => (
            <p key={index} className={cn("text-etc-red mt-1 text-sm")}>
              {message}
            </p>
          ))
        : null}
    </div>
  );
}
