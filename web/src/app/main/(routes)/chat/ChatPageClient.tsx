"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/app/shared/ui/molecule/card";
import { SSEProvider } from "@/app/shared/sse/business/context/sseContext";
import { useSSE } from "@/app/shared/sse/business/hook/useSSE";
import WineRecommendCard from "@/app/feature/wine/ui/WineRecommendCard";

type PairingChunkType = "TITLE" | "COMMENT" | "REASON";

interface ChatPageClientProps {
  keywords: string[];
  wines: string[];
}

interface ChatSSEEvent {
  type: "PAIRING" | "CHAT";
  data:
    | {
        content: string;
      }
    | {
        type: PairingChunkType;
        rank: number;
        content: string;
      };
}

interface PairingRecommendation {
  rank: number;
  title: string;
  comment: string;
  reason: string;
}

const createEmptyRecommendation = (rank: number): PairingRecommendation => ({
  rank,
  title: "",
  comment: "",
  reason: "",
});

const isRecommendationComplete = (recommendation?: PairingRecommendation) =>
  Boolean(
    recommendation &&
    recommendation.title.trim() &&
    recommendation.comment.trim() &&
    recommendation.reason.trim(),
  );

const PairingStreamView = ({ keywords, wines }: ChatPageClientProps) => {
  const { open, close, sseState, errorMessage } = useSSE();
  const chatIdRef = useRef<string>(crypto.randomUUID());
  const pairingRequestedRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [chatAnswer, setChatAnswer] = useState("");
  const [pairingList, setPairingList] = useState<PairingRecommendation[]>([]);

  const hasValidRequest = useMemo(
    () => keywords.length > 0 && wines.length > 0,
    [keywords, wines],
  );

  const visiblePairingList = useMemo(() => {
    const pairingByRank = new Map(pairingList.map((item) => [item.rank, item]));
    const nextVisibleList: PairingRecommendation[] = [];

    for (const rank of [1, 2, 3]) {
      const recommendation = pairingByRank.get(rank);
      const previousRecommendation =
        rank === 1 ? undefined : pairingByRank.get(rank - 1);

      if (rank === 1) {
        if (!recommendation) {
          break;
        }

        nextVisibleList.push(recommendation);
        continue;
      }

      if (
        !previousRecommendation ||
        !isRecommendationComplete(previousRecommendation)
      ) {
        break;
      }

      if (!recommendation) {
        nextVisibleList.push(createEmptyRecommendation(rank));
        continue;
      }

      nextVisibleList.push(recommendation);
    }

    return nextVisibleList;
  }, [pairingList]);

  useEffect(() => {
    if (!scrollContainerRef.current || visiblePairingList.length === 0) {
      return;
    }

    scrollContainerRef.current.scrollTo({
      left: scrollContainerRef.current.scrollWidth,
      behavior: "smooth",
    });
  }, [visiblePairingList.length]);

  useEffect(() => {
    if (!hasValidRequest) {
      return;
    }

    open(`/api/chat/answer?chatId=${chatIdRef.current}`, [
      {
        eventName: "message",
        handle: (event) => {
          const payload = JSON.parse(event.data) as ChatSSEEvent;

          if (payload.type === "CHAT" && "content" in payload.data) {
            setChatAnswer((prev) => prev + payload.data.content);
            return;
          }

          if (payload.type !== "PAIRING" || !("type" in payload.data)) {
            return;
          }

          const nextChunk = payload.data;

          setPairingList((prev) => {
            const pairingByRank = new Map(
              prev.map((item) => [item.rank, item]),
            );
            const currentRecommendation =
              pairingByRank.get(nextChunk.rank) ??
              createEmptyRecommendation(nextChunk.rank);

            const nextRecommendation =
              nextChunk.type === "TITLE"
                ? {
                    ...currentRecommendation,
                    title: currentRecommendation.title + nextChunk.content,
                  }
                : nextChunk.type === "COMMENT"
                  ? {
                      ...currentRecommendation,
                      comment:
                        currentRecommendation.comment + nextChunk.content,
                    }
                  : {
                      ...currentRecommendation,
                      reason: currentRecommendation.reason + nextChunk.content,
                    };

            pairingByRank.set(nextChunk.rank, nextRecommendation);

            return Array.from(pairingByRank.values()).sort(
              (a, b) => a.rank - b.rank,
            );
          });
        },
      },
    ]);

    return () => {
      close();
    };
  }, [close, hasValidRequest, open]);

  useEffect(() => {
    if (
      !hasValidRequest ||
      sseState !== "OPEN" ||
      pairingRequestedRef.current
    ) {
      return;
    }

    pairingRequestedRef.current = true;

    void (async () => {
      const response = await fetch("/api/chat/pairing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Chat-Id": chatIdRef.current,
        },
        body: JSON.stringify({
          wines: wines.map((wine) => ({ name: wine })),
          menuCategories: keywords,
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as { message?: string };

        setRequestError(errorBody.message ?? "페어링 요청에 실패했습니다.");
      }
    })();
  }, [hasValidRequest, keywords, sseState, wines]);

  return (
    <section className="flex h-full flex-col gap-4">
      <div className="p-4">
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-slate-600">연결 상태: {sseState}</p>
            <p className="text-sm text-slate-600">
              선택 키워드: {keywords.join(", ") || "-"}
            </p>
            <p className="text-sm text-slate-600">
              선택 와인: {wines.join(", ") || "-"}
            </p>
            {(errorMessage || requestError) && (
              <p className="text-sm text-red-500">
                {requestError ?? errorMessage}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="overflow-visible">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-10"
        >
          <div className="flex gap-10 pb-2">
            {visiblePairingList.map((pairing) => (
              <WineRecommendCard
                key={pairing.rank}
                image="/carrot4.jpeg"
                rank={pairing.rank}
                title={pairing.title}
                reason={pairing.reason}
                comment={pairing.comment}
              />
            ))}
          </div>
        </div>
      </div>

      {chatAnswer && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm leading-6 text-slate-700">{chatAnswer}</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default function ChatPageClient(props: ChatPageClientProps) {
  return (
    <SSEProvider>
      <PairingStreamView {...props} />
    </SSEProvider>
  );
}
