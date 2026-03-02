"use client";

import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/app/utils/style/helper";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  maxRows?: number;
  onValueChange?: (value: string) => void;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      className,
      autoResize = true,
      maxRows = 6,
      disabled = false,
      rows = 1,
      onChange,
      onValueChange,
      ...props
    },
    ref
  ) {
    const [innerElement, setInnerElement] = useState<HTMLTextAreaElement | null>(
      null
    );

    const setRefs = useCallback((node: HTMLTextAreaElement | null) => {
      setInnerElement(node);

      if (typeof ref === "function") {
        ref(node);
        return;
      }

      if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          node;
      }
    }, [ref]);

    const resize = useCallback(() => {
      const el = innerElement;
      if (!el || !autoResize) return;

      el.style.height = "auto";
      const styles = window.getComputedStyle(el);
      const lineHeight = parseFloat(styles.lineHeight);
      const paddingTop = parseFloat(styles.paddingTop);
      const paddingBottom = parseFloat(styles.paddingBottom);
      const maxHeight = (lineHeight + paddingTop + paddingBottom) * maxRows;
      const nextHeight = Math.min(el.scrollHeight, maxHeight);

      el.style.height = `${nextHeight}px`;
    }, [autoResize, innerElement, maxRows]);

    useEffect(() => {
      resize();
    }, [props.value, resize]);

    return (
      <textarea
        {...props}
        ref={setRefs}
        rows={rows}
        disabled={disabled}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(e.target.value);
          resize();
        }}
        className={cn(
          "w-full flex-1 resize-none rounded-lg bg-transparent px-3 py-2 text-sm outline-none",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          disabled ? "text-gray-6 placeholder:text-gray-6" : "text-text-03",
          className
        )}
      />
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
