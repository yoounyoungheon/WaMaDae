import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/utils/style/helper";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solid: "",
        outline: "border",
        text: "bg-transparent",
      },
      type: {
        primary: "",
        error: "",
        cancel: "",
      },
      size: {
        default: "rounded-lg p-3",
        icon: "rounded-full h-9 w-9",
      },
      radius: {
        sm: "rounded",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "solid",
      type: "primary",
      size: "default",
      radius: "lg",
    },
    compoundVariants: [
      {
        variant: "solid",
        type: "primary",
        className:
          "bg-primary-main text-slate-50 shadow-md hover:bg-primary-action",
      },
      {
        variant: "outline",
        type: "primary",
        className:
          "border-primary-main text-primary-main shadow-md hover:bg-primary-main/10",
      },
      {
        variant: "text",
        type: "primary",
        className:
          "bg-white text-primary-main shadow-[0_0_4px_0_var(--tw-shadow-color)] shadow-primary-main/40 hover:bg-primary-main/10",
      },
      {
        variant: "solid",
        type: "error",
        className:
          "bg-error-main text-slate-50 shadow-md hover:bg-error-action",
      },
      {
        variant: "outline",
        type: "error",
        className:
          "border-error-main text-error-main shadow-md hover:bg-error-main/10",
      },
      {
        variant: "text",
        type: "error",
        className:
          "bg-white text-error-main shadow-[0_0_4px_0_var(--tw-shadow-color)] shadow-error-main/40 hover:bg-error-main/10",
      },
      {
        variant: "solid",
        type: "cancel",
        className:
          "bg-main-gray-500 text-slate-50 shadow-md hover:bg-main-gray-500/90",
      },
      {
        variant: "outline",
        type: "cancel",
        className:
          "border-main-gray-500 text-main-gray-500 shadow-md hover:bg-main-gray-500/10",
      },
      {
        variant: "text",
        type: "cancel",
        className:
          "bg-white text-main-gray-500 shadow-[0_0_4px_0_var(--tw-shadow-color)] shadow-main-gray-500/40 hover:bg-main-gray-500/10",
      },
    ],
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  htmlType?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      disabled,
      type,
      size,
      radius,
      asChild = false,
      htmlType,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const disabledClassName = disabled
      ? {
          primary:
            "bg-primary-disabled text-slate-50 border-transparent shadow-none hover:bg-primary-disabled",
          error:
            "bg-error-cancel text-slate-50 border-transparent shadow-none hover:bg-error-cancel",
          cancel:
            "bg-main-gray-300 text-slate-50 border-transparent shadow-none hover:bg-main-gray-300",
        }[type ?? "primary"]
      : "";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, type, size, radius, className }),
          disabledClassName
        )}
        ref={ref}
        type={asChild ? undefined : htmlType}
        disabled={asChild ? undefined : disabled}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;

export { buttonVariants };
