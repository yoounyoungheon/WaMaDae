import { cn } from "@/app/utils/style/helper";
import type { ChatAnswerBubbleProps } from "./wine-pairing-chat.props";

/**
 * 후속 채팅 한 턴(질문 + 스트리밍 답변)의 말풍선.
 * 질문은 우측 정렬, 답변은 좌측 정렬 말풍선으로 표시하고
 * 스트리밍 중에는 타이핑 인디케이터를 보여준다.
 */
export default function ChatAnswerBubble({
  turn,
  className,
}: ChatAnswerBubbleProps) {
  const isStreaming = turn.status === "streaming";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="max-w-[88%] self-end break-words rounded-[16px] rounded-br-md border border-white/80 bg-white/55 px-4 py-3 text-[14px] leading-relaxed text-ink-page shadow-[0_8px_20px_rgba(72,52,112,0.05)]">
        {turn.question}
      </p>

      <div
        role={turn.status === "error" ? "alert" : undefined}
        aria-busy={isStreaming}
        className="max-w-[94%] self-start whitespace-pre-wrap break-words px-0.5 py-2 text-[15px] leading-[1.8] text-ink-page"
      >
        {turn.answer}
        {isStreaming ? (
          <span aria-hidden className="ml-0.5 inline-flex gap-0.5 align-baseline">
            <TypingDot className="[animation-delay:0ms]" />
            <TypingDot className="[animation-delay:150ms]" />
            <TypingDot className="[animation-delay:300ms]" />
          </span>
        ) : null}
        {turn.status === "error" ? (
          <p className="mt-1.5 text-[12px] text-error-main">
            {turn.errorMessage ?? "채팅 응답을 불러오지 못했습니다."}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TypingDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "h-1 w-1 animate-bounce rounded-full bg-ink-muted motion-reduce:animate-none",
        className
      )}
    />
  );
}
