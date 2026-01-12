"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { ActionButton, SendButton } from "./SendMessageForm.part";

type SendMessageFormProps = {
  onSend: (payload: { message: string }) => void;
  placeholder?: string;
};

export const SendMessageForm = ({
  onSend,
  placeholder = "메시지를 입력하세요...",
}: SendMessageFormProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_ROWS = 6;

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    onSend({ message: trimmed });
    setMessage("");
  };

  // textarea resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const styles = window.getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight);
    const paddingTop = parseFloat(styles.paddingTop);
    const paddingBottom = parseFloat(styles.paddingBottom);
    const maxHeight = (lineHeight + paddingTop + paddingBottom) * MAX_ROWS;
    const nextHeight = Math.min(el.scrollHeight, maxHeight);

    el.style.height = `${nextHeight}px`;
  }, [message]);

  return (
    <div
      className={clsx(
        "grid w-full items-center border rounded-lg p-1",
        "grid-cols-1"
      )}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        className="flex-1 resize-none rounded-lg  bg-transparent  px-3 py-2 text-sm  outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      />
      <div className="flex justify-between p-0.5">
        <ActionButton />
        <SendButton onClick={handleSubmit} />
      </div>
    </div>
  );
};
