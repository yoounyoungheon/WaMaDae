"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import Button from "@/app/shared/ui/atom/button";
import LoadingSpinner from "@/app/shared/ui/atom/loading-spinner";
import { cn } from "@/app/utils/style/helper";
import { useWinePairingConversation } from "../api/use-wine-pairing-conversation";
import type { PairingTurn } from "../model/conversation.types";
import ChatAnswerBubble from "./ChatAnswerBubble";
import ChatComposer from "./ChatComposer";
import WineRecommendationCarousel from "./WineRecommendationCarousel";
import type { WinePairingChatViewProps } from "./wine-pairing-chat.props";

/**
 * 와인 페어링 스트리밍 대화 화면(designs/p6.png).
 *
 * 진입 시 페어링 SSE로 추천 캐러셀을 점진 렌더하고, 완료 후에는 하단 입력창으로
 * 후속 질문을 보내 답변 말풍선을 대화에 누적한다.
 */
export default function WinePairingChatView({
  className,
}: WinePairingChatViewProps) {
  const {
    turns,
    hasRequest,
    isHydrated,
    isPairingDone,
    isComposerEnabled,
    sendChat,
    retryPairing,
  } = useWinePairingConversation();

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTurn = turns[turns.length - 1];
  const lastChatAnswerLength =
    lastTurn?.kind === "chat" ? lastTurn.answer.length : -1;

  // 채팅 턴이 진행될 때만 대화 하단으로 자동 스크롤한다(캐러셀 페인팅 중에는 유지).
  useEffect(() => {
    if (lastChatAnswerLength >= 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [lastChatAnswerLength]);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        <div className="mx-auto flex min-h-full w-full max-w-[680px] flex-col gap-7 px-5 pb-10 pt-5">
          {!isHydrated ? (
            <StatePanel tone="pending" message="와인 추천을 준비하고 있어요." />
          ) : !hasRequest ? (
            <StatePanel
              tone="empty"
              message="추천 정보를 찾을 수 없어요. 와인과 메뉴를 먼저 선택해 주세요."
              action={
                <Button
                  asChild
                  variant="outline"
                  type="primary"
                  radius="lg"
                  className="h-11 rounded-lg px-6 py-3 text-[14px] font-bold"
                >
                  <Link href="/wine/list">와인 선택하러 가기</Link>
                </Button>
              }
            />
          ) : (
            <>
              <section aria-labelledby="wine-recommendation-intro-title">
                <h2
                  id="wine-recommendation-intro-title"
                  className="text-[25px] font-extrabold leading-tight text-ink-page"
                >
                  마이쏨이 추천하는 와인이에요
                </h2>
                <p className="mt-3 text-[14px] font-medium leading-relaxed text-ink-secondary">
                  선택한 메뉴와 잘 어울리는 순서예요
                </p>
              </section>
              {turns.map((turn, index) =>
                turn.kind === "pairing" ? (
                  <PairingTurnSection
                    key={`turn-${index}`}
                    turn={turn}
                    onRetry={retryPairing}
                  />
                ) : (
                  <ChatAnswerBubble key={`turn-${index}`} turn={turn} />
                )
              )}
            </>
          )}
          <div ref={bottomRef} aria-hidden />
        </div>
      </main>

      <div className="shrink-0 border-t border-white/70 bg-canvas/90 px-5 pb-[calc(14px_+_env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(60,45,96,0.08)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-[640px]">
          <ChatComposer
            disabled={!isComposerEnabled}
            placeholder={
              isPairingDone
                ? "채팅을 입력하세요"
                : "와인 추천이 끝나면 질문할 수 있어요"
            }
            onSend={sendChat}
          />
        </div>
      </div>
    </div>
  );
}

function PairingTurnSection({
  turn,
  onRetry,
}: {
  turn: PairingTurn;
  onRetry: () => void;
}) {
  return (
    <section aria-label="추천 와인" className="flex flex-col gap-4">
      {turn.source === "recommendation" && turn.question ? (
        <p className="max-w-[88%] self-end rounded-[16px] rounded-br-md border border-white/80 bg-white/55 px-4 py-3 text-[14px] leading-relaxed text-ink-page shadow-[0_8px_20px_rgba(72,52,112,0.05)]">
          {turn.question}
        </p>
      ) : null}

      {turn.slides.length > 0 ? (
        // 캐러셀 스크롤 영역은 페이지 패딩(px-[23px])을 상쇄해 화면 전체 폭을 쓴다.
        // 카드 여백은 캐러셀 슬라이드 내부 패딩(px-[23px])이 담당한다.
        <WineRecommendationCarousel
          slides={turn.slides}
          className="-mx-5 w-auto"
        />
      ) : null}

      {turn.status === "streaming" && turn.slides.length === 0 ? (
        <StatePanel tone="pending" message="어울리는 와인을 찾고 있어요." />
      ) : null}

      {turn.status === "error" ? (
        <StatePanel
          tone="error"
          message={turn.errorMessage ?? "와인 추천을 불러오지 못했습니다."}
          action={
            <Button
              htmlType="button"
              variant="outline"
              type="primary"
              radius="lg"
              onClick={onRetry}
              className="h-11 rounded-lg px-6 py-3 text-[14px] font-bold"
            >
              다시 시도
            </Button>
          }
        />
      ) : null}
    </section>
  );
}

function StatePanel({
  tone,
  message,
  action,
}: {
  tone: "pending" | "error" | "empty";
  message: string;
  action?: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : tone === "pending" ? "status" : undefined}
      className="flex flex-col items-center justify-center gap-4 rounded-[16px] border border-white/80 bg-white/45 px-5 py-10 text-center shadow-[0_10px_26px_rgba(72,52,112,0.05)]"
    >
      {tone === "pending" ? (
        <LoadingSpinner label="와인 추천 준비 중" className="h-10 w-10" />
      ) : null}
      <p
        className={cn(
          "text-[15px] leading-relaxed",
          tone === "error" ? "text-error-main" : "text-ink-secondary"
        )}
      >
        {message}
      </p>
      {action}
    </div>
  );
}
