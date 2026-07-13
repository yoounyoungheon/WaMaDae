"use client";

import { useState, type FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import Button from "@/app/shared/ui/atom/button";
import TextInput from "@/app/shared/ui/atom/text-input";
import { cn } from "@/app/utils/style/helper";
import type { ChatComposerProps } from "./wine-pairing-chat.props";

/**
 * 후속 질문 입력창(designs/p6.png 하단).
 * 페어링 스트림이 끝나기 전과 채팅 응답 스트리밍 중에는 비활성화된다.
 */
export default function ChatComposer({
  disabled = false,
  placeholder = "채팅을 입력하세요",
  onSend,
  className,
}: ChatComposerProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = message.trim();
    if (disabled || trimmed.length === 0) {
      return;
    }

    onSend(trimmed);
    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex items-center gap-2", className)}
      aria-label="와인 페어링 후속 질문"
    >
      <div className="min-w-0 flex-1">
        <TextInput
          value={message}
          onValueChange={setMessage}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="후속 질문 입력"
          enterKeyHint="send"
          // focus 시 테두리 색이 변한 것처럼 보이는 focus ring을 제거한다.
          className="focus-visible:ring-0"
        />
      </div>
      <Button
        htmlType="submit"
        variant="solid"
        type="primary"
        size="icon"
        radius="full"
        disabled={disabled || message.trim().length === 0}
        aria-label="질문 보내기"
        className="shrink-0"
      >
        <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
      </Button>
    </form>
  );
}
