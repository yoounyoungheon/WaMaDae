"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { ActionButton, SendButton } from "./SendMessageForm.part";
import Image from "next/image";

type SendMessageFormProps = {
  onSend: (payload: { message: string; imageUrl?: string }) => void;
  placeholder?: string;
};

export const SendMessageForm = ({
  onSend,
  placeholder = "메시지를 입력하세요...",
}: SendMessageFormProps) => {
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_ROWS = 6;

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed && !imageUrl) return;

    onSend({ message: trimmed, imageUrl: imageUrl ?? undefined });
    setMessage("");
    setImageUrl(null);
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
      {imageUrl ? (
        <div className="flex items-center gap-2 px-3 pb-2">
          <div className="relative">
            <Image
              src={imageUrl}
              height={28}
              width={28}
              alt="선택한 이미지 미리보기"
              className="h-12 w-12 rounded object-cover"
            />
            <button
              type="button"
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border bg-white text-xs"
              onClick={() => setImageUrl(null)}
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
      <div className="flex justify-between p-0.5">
        <ActionButton onSelectImage={setImageUrl} />
        <SendButton onClick={handleSubmit} />
      </div>
    </div>
  );
};
