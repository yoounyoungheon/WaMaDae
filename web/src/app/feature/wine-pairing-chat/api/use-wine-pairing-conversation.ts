"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  streamWinePairing,
  streamWinePairingChat,
} from "@/app/entity/wine-pairing/api/wine-pairing.api";
import { loadWinePairingRequest } from "@/app/entity/wine-pairing/lib/wine-pairing-request-storage";
import type {
  PairingStreamEvent,
  WinePairingRequest,
} from "@/app/entity/wine-pairing/model/wine-pairing.type";
import {
  conversationReducer,
  initialConversationState,
} from "../model/conversation.reducer";
import type { ConversationAction } from "../model/conversation.types";

const PAIRING_ERROR_FALLBACK = "와인 추천을 불러오지 못했습니다.";
const CHAT_ERROR_FALLBACK = "채팅 응답을 불러오지 못했습니다.";

type StoredPairingRequest = {
  request: WinePairingRequest | null;
  isHydrated: boolean;
};

/**
 * 와인 페어링 대화 컨트롤러 훅.
 *
 * - 순수 reducer가 대화 상태를 계산하고, 스트림 읽기(부수효과)는 이 훅에 격리한다.
 * - chatId는 페어링 실행마다 새로 생성한다(한 chatId로 pairing은 1회만 허용).
 * - SSE 데이터는 Zustand/TanStack Query에 저장하지 않는다(뷰 로컬 상태).
 */
export function useWinePairingConversation() {
  // sessionStorage 스냅샷은 hydration 이후 클라이언트에서 한 번 읽는다.
  const [stored, setStored] = useState<StoredPairingRequest>({
    request: null,
    isHydrated: false,
  });

  useEffect(() => {
    setStored({ request: loadWinePairingRequest(), isHydrated: true });
  }, []);

  const [state, dispatch] = useReducer(
    conversationReducer,
    initialConversationState
  );

  const chatIdRef = useRef<string | null>(null);
  const startedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const [runNonce, setRunNonce] = useState(0);

  const { request, isHydrated } = stored;

  useEffect(() => {
    if (!isHydrated || !request || startedRef.current) {
      return;
    }
    startedRef.current = true;

    const controller = new AbortController();
    abortRef.current = controller;
    chatIdRef.current = crypto.randomUUID();

    void runPairingStream(request, chatIdRef.current, controller, dispatch);

    return () => {
      // StrictMode 재마운트/실제 언마운트 모두 스트림을 취소하고 재시작 가능 상태로 되돌린다.
      controller.abort();
      startedRef.current = false;
      dispatch({ type: "RESET" });
    };
  }, [isHydrated, request, runNonce]);

  /** 페어링 실패 시 새 chatId로 처음부터 다시 시작한다. */
  const retryPairing = useCallback(() => {
    abortRef.current?.abort();
    startedRef.current = false;
    dispatch({ type: "RESET" });
    setRunNonce((nonce) => nonce + 1);
  }, []);

  const isPairingDone = state.pairing === "done";
  const isChatStreaming = state.chat === "streaming";
  const isComposerEnabled = isPairingDone && !isChatStreaming;

  const sendChat = useCallback(
    (rawMessage: string) => {
      const message = rawMessage.trim();
      const chatId = chatIdRef.current;
      const signal = abortRef.current?.signal;

      if (!message || !chatId || !isComposerEnabled) {
        return;
      }

      // 질문 버블을 즉시 표시한다. 첫 SSE frame으로 ChatTurn/PairingTurn을 확정한다.
      dispatch({ type: "CHAT_START", question: message });

      void (async () => {
        let turnKind: "chat" | "pairing" | null = null;

        try {
          for await (const event of streamWinePairingChat(
            { message },
            chatId,
            signal
          )) {
            if (signal?.aborted) return;

            if (turnKind === null) {
              if (event.fieldName === "chat") {
                turnKind = "chat";
                dispatch({ type: "CHAT_APPEND", chunk: event.data });
              } else {
                turnKind = "pairing";
                // RECOMMENDATION_START가 빈 ChatTurn을 제거하고 PairingTurn으로 대체한다.
                dispatch({ type: "RECOMMENDATION_START", question: message });
                const action = mapPairingEventToAction(event);
                if (action) dispatch(action);
              }
            } else if (turnKind === "chat") {
              if (event.fieldName === "chat") {
                dispatch({ type: "CHAT_APPEND", chunk: event.data });
              }
            } else {
              if (event.fieldName !== "chat") {
                const action = mapPairingEventToAction(event);
                if (action) dispatch(action);
              }
            }
          }

          if (turnKind === "pairing") {
            dispatch({ type: "PAIRING_DONE" });
          } else {
            dispatch({ type: "CHAT_DONE" });
          }
        } catch (error) {
          if (signal?.aborted) return;

          if (turnKind === "pairing") {
            dispatch({
              type: "PAIRING_ERROR",
              message: toErrorMessage(error, CHAT_ERROR_FALLBACK),
            });
          } else {
            dispatch({
              type: "CHAT_ERROR",
              message: toErrorMessage(error, CHAT_ERROR_FALLBACK),
            });
          }
        }
      })();
    },
    [isComposerEnabled]
  );

  return {
    turns: state.turns,
    hasRequest: Boolean(request),
    isHydrated,
    pairingStatus: state.pairing,
    chatStatus: state.chat,
    isPairingDone,
    isStreaming: state.pairing === "streaming" || isChatStreaming,
    isComposerEnabled,
    errorMessage: state.errorMessage ?? null,
    sendChat,
    retryPairing,
  };
}

async function runPairingStream(
  request: WinePairingRequest,
  chatId: string,
  controller: AbortController,
  dispatch: (action: ConversationAction) => void
) {
  dispatch({ type: "PAIRING_START" });

  try {
    for await (const event of streamWinePairing(
      request,
      chatId,
      controller.signal
    )) {
      if (controller.signal.aborted) {
        return;
      }

      const action = mapPairingEventToAction(event);
      if (action) {
        dispatch(action);
      }
    }
    dispatch({ type: "PAIRING_DONE" });
  } catch (error) {
    if (controller.signal.aborted) {
      return;
    }
    dispatch({
      type: "PAIRING_ERROR",
      message: toErrorMessage(error, PAIRING_ERROR_FALLBACK),
    });
  }
}

/**
 * SSE 프레임을 reducer 액션으로 변환한다.
 * `fieldName`으로 그릴 부분을 찾고, `text`는 부분 페인팅, `json`은 전체 replace.
 * 알 수 없는 프레임은 무시한다(forward-compat).
 */
function mapPairingEventToAction(
  event: PairingStreamEvent
): ConversationAction | null {
  switch (event.fieldName) {
    case "imageUrl":
      return { type: "PAIRING_SLIDE_START", imageUrl: event.data };
    case "rank":
    case "name":
    case "comment":
    case "reason":
      return {
        type: "PAIRING_SLIDE_FIELD",
        field: event.fieldName,
        data: event.data,
      };
    case "pairing":
      return { type: "PAIRING_SLIDE_COMMIT", payload: event.data };
    default:
      return null;
  }
}

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
