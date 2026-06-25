import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/app/utils/style/helper";

export interface ChoiceChipProps {
  inputType: "radio" | "checkbox";
  name?: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  iconPath?: string;
  selectedTone?: "purple" | "blue";
  disabled?: boolean;
  className?: string;
}

export default function ChoiceChip({
  inputType,
  name,
  value,
  checked,
  onChange,
  children,
  iconPath,
  selectedTone = "purple",
  disabled = false,
  className,
}: ChoiceChipProps) {
  return (
    <label
      className={cn(
        "inline-flex min-h-9 cursor-pointer items-center rounded-full border border-main-light-gray-600 bg-white px-3 py-2",
        "text-[11px] font-medium leading-none text-text-02 shadow-sm transition-colors",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-main",
        selectedTone === "purple"
          ? "has-[:checked]:border-primary-main has-[:checked]:bg-main-purple-400 has-[:checked]:text-white"
          : "has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500 has-[:checked]:text-white",
        disabled &&
          "cursor-not-allowed border-line-disabled bg-text-disabled-01 text-text-04 shadow-none",
        className
      )}
    >
      <input
        type={inputType}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      <span className="inline-flex items-center gap-1.5">
        {iconPath ? (
          <Image
            src={iconPath}
            alt=""
            aria-hidden
            width={14}
            height={14}
            className="h-3.5 w-3.5 shrink-0 object-contain"
          />
        ) : null}
        <span>{children}</span>
      </span>
    </label>
  );
}
