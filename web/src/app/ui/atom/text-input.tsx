'use client';
import React from 'react';
import { cn } from '@/app/utils/style/helper';
import { getInputColors } from '@/app/utils/style/helper';

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'password' | 'number';
  icon?: React.ElementType;
  error?: boolean;
  errorMessages?: string[];
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    type,
    icon,
    error = false,
    errorMessages,
    disabled = false,
    placeholder,
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
          getInputColors(disabled, error),
        )}
      >
        {Icon ? <Icon className="text-gray-6 ml-2.5 h-5 w-5 shrink-0" /> : null}
        <input
          {...props}
          ref={ref}
          type={type}
          className={cn(
            'w-full rounded-lg border border-gray-300 p-3 resize-none ring-gray-200 focus:border-none focus:outline-none focus:ring-2 focus:ring-blue-200',
            
            'ring-gray-200',
            'shadow-none',
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
