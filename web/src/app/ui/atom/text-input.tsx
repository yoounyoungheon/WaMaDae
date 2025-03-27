'use client';
import React from 'react';
import { cn } from '@/app/utils/style/helper';
import { getInputColors } from '@/app/utils/style/helper';
import { cva, type VariantProps } from 'class-variance-authority';

const textInputVariants = cva(
  'relative flex w-full min-w-[10rem] items-center rounded-lg border outline-none transition duration-100',
  {
    variants: {
      variant: {
        default: 'border-gray-300 shadow-md has-[:focus]:ring-2 has-[:focus]:border-blue-400 has-[:focus]:ring-blue-200',
        secondary: 'rounded-none border-x-0 border-t-0 border-b-2 border-gray-400 has-[:focus]:border-blue-400',
      },
      sizeVariants: {
        default: 'py-1 text-lg',
        sm: 'py-0 text-sm',
        lg: 'py-1 text-3xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      sizeVariants: 'default',
    },
  }
);

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof textInputVariants> {
  type?: 'text' | 'password' | 'number';
  icon?: React.ElementType;
  error?: boolean;
  errorMessages?: string[];
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    variant,
    sizeVariants,
    type,
    icon,
    error = false,
    errorMessages,
    disabled = false,
    placeholder,
    className,
    onValueChange,
    ...props
  },
  ref,
) {
  const Icon = icon;

  return (
    <>
      <div
        className={cn(
          textInputVariants({ variant, sizeVariants, className }),
          getInputColors(disabled, error),
        )}
      >
        {Icon ? <Icon className="text-gray-6 ml-2.5 h-5 w-5 shrink-0" /> : null}
        <input
          {...props}
          ref={ref}
          type={type}
          className={cn(
            'w-full rounded-lg border-none bg-transparent transition duration-100 focus:outline-none focus:ring-0',
            'py-1' ,
            'text-black-1',
            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            Icon ? 'pl-2' : 'pl-3',
            error ? 'pr-9' : 'pr-3',
            disabled ? 'text-gray-6 placeholder:text-gray-6' : 'placeholder:text-gray-6',
          )}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            onValueChange?.(e.target.value);
          }}
        />
        {error ? (
          <div>Error</div>
        ) : null}
      </div>
      {error && errorMessages
        ? errorMessages.map((message, index) => (
            <p key={index} className={cn('text-red-500 mt-1 text-sm')}>
              {message}
            </p>
          ))
        : null}
    </>
  );
});

export default TextInput;
