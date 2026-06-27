"use client";

import { MessageCircle } from "lucide-react";

interface FloatingChatButtonProps {
  onClick: () => void;
}

export default function FloatingChatButton({
  onClick,
}: FloatingChatButtonProps) {
  return (
    <button
      type="button"
      aria-label="채팅 열기"
      className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-5 z-40 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-gradient-to-br from-[#d88cff] via-[#b75cf6] to-[#8f3fe8] text-white shadow-[0_12px_28px_rgba(183,92,246,0.35)] transition-transform active:scale-95"
      onClick={onClick}
    >
      <MessageCircle className="h-6 w-6" aria-hidden />
    </button>
  );
}
