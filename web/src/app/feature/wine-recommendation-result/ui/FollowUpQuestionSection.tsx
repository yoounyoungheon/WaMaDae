"use client";

import { MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/app/utils/style/helper";
import type { FollowUpQuestionSectionProps } from "./wine-recommendation-result.props";

export default function FollowUpQuestionSection({
  questions,
  onQuestionClick,
  className,
}: FollowUpQuestionSectionProps) {
  return (
    <section className={cn("min-w-0", className)}>
      <h2 className="flex items-center gap-2 text-[16px] font-bold leading-none text-text-01">
        <Sparkles className="h-4 w-4 text-primary-main" aria-hidden />
        추가적인 질문을 해보세요
      </h2>

      {questions.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-3">
          {questions.map((question) => (
            <button
              key={question.id}
              type="button"
              className="relative flex min-h-[66px] items-center justify-center rounded-lg border border-primary-main/35 bg-white px-3 text-center text-[12px] font-medium leading-normal text-text-02 shadow-sm transition-colors hover:bg-primary-main/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main/50"
              onClick={() => onQuestionClick(question)}
            >
              <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-main text-white shadow-md">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              </span>
              {question.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-main-light-gray-600 bg-white px-4 py-5 text-center text-[13px] font-medium text-text-03">
          표시할 추가 질문이 없습니다.
        </p>
      )}
    </section>
  );
}
