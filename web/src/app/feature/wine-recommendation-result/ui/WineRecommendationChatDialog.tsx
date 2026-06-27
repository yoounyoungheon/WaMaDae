"use client";

import { FormEvent } from "react";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/app/shared/ui/shadcn/dialog";
import type { WineRecommendationChatDialogProps } from "./wine-recommendation-result.props";

export default function WineRecommendationChatDialog({
  open,
  inputValue,
  chat,
  selectedQuestionLabel,
  onOpenChange,
  onInputChange,
  onSubmit,
}: WineRecommendationChatDialogProps) {
  const trimmedMessage = inputValue.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedMessage) {
      return;
    }

    onSubmit(trimmedMessage);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-transparent"
        closeClassName="right-4 top-3 text-white opacity-100 hover:opacity-80 focus:ring-white/70 data-[state=open]:bg-transparent data-[state=open]:text-white"
        className="bottom-[92px] left-auto right-[18px] top-auto z-50 flex w-[300px] max-w-[calc(100vw-36px)] translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-[0_18px_45px_rgba(15,23,42,0.18)] data-[state=closed]:slide-out-to-bottom-2 data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-bottom-2 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0"
      >
        <div className="bg-gradient-to-r from-[#d88cff] via-[#b75cf6] to-[#8f3fe8] px-4 py-3 pr-11">
          <DialogTitle className="text-left text-[13px] font-extrabold leading-none text-white">
            채팅으로 질문해보세요!
          </DialogTitle>
          <DialogDescription className="sr-only">
            추천 와인에 대해 추가 질문을 입력하는 채팅창입니다.
          </DialogDescription>
        </div>

        <div className="flex min-h-[214px] flex-col gap-3 bg-white px-4 py-4">
          <div className="rounded-xl border border-main-light-gray-600 bg-white px-3 py-3 text-[11px] font-medium leading-normal text-text-02 shadow-sm">
            {chat.greetingMessage}
          </div>

          {selectedQuestionLabel ? (
            <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-md bg-gradient-to-br from-[#c979ff] to-[#8f3fe8] px-4 py-3 text-[12px] font-bold leading-normal text-white">
              {selectedQuestionLabel}
            </div>
          ) : null}

          <div className="rounded-xl border border-main-light-gray-600 bg-white px-3 py-3 text-[11px] font-medium leading-relaxed text-text-02 shadow-sm">
            {chat.sampleAnswer}
          </div>
        </div>

        <form
          className="flex items-center gap-2 border-t border-main-light-gray-600 bg-background-03 px-3 py-3"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="wine-recommendation-chat-input">
            채팅 메시지
          </label>
          <input
            id="wine-recommendation-chat-input"
            value={inputValue}
            placeholder="채팅을 입력하세요"
            className="min-w-0 flex-1 rounded-full border border-main-light-gray-600 bg-white px-4 py-2.5 text-[12px] font-medium text-text-01 outline-none placeholder:text-text-04 focus:border-primary-main"
            onChange={(event) => onInputChange(event.target.value)}
          />
          <button
            type="submit"
            aria-label="채팅 메시지 전송"
            disabled={!trimmedMessage}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#c979ff] to-[#8f3fe8] text-white shadow-md disabled:from-primary-disabled disabled:to-primary-disabled"
          >
            <Send className="h-4 w-4" aria-hidden />
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
