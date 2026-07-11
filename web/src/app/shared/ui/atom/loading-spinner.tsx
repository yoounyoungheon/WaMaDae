import type { ComponentPropsWithoutRef } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/app/utils/style/helper";

export interface LoadingSpinnerProps
  extends Omit<
    ComponentPropsWithoutRef<"span">,
    "aria-label" | "children" | "role"
  > {
  label?: string;
}

export default function LoadingSpinner({
  label = "로딩 중",
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <span
      {...props}
      role="status"
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center text-primary-main",
        className
      )}
    >
      <LoaderCircle
        aria-hidden="true"
        className="h-full w-full animate-spin motion-reduce:animate-none"
        strokeWidth={2.25}
      />
    </span>
  );
}
