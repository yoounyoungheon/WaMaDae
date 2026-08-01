import type {
  ChatTurn,
  ConversationAction,
  ConversationState,
  ConversationTurn,
  PairingSlideView,
  PairingTurn,
} from "./conversation.types";

export const initialConversationState: ConversationState = {
  turns: [],
  pairing: "idle",
  chat: "idle",
};

/**
 * 대화 상태 순수 reducer.
 *
 * SSE 렌더링 규칙(백엔드 협의 기준)의 구현:
 * - `imageUrl`(text/start) → 새 슬라이드 인스턴스 시작
 * - `rank`/`name`/`comment`/`reason`(text/painting) → 해당 필드 점진 페인팅
 * - `pairing`(json/next) → 슬라이드 전체를 최종 payload로 replace(권위값)
 * - `chat`(text) → 마지막 채팅 말풍선에 청크 이어붙임
 */
export function conversationReducer(
  state: ConversationState,
  action: ConversationAction
): ConversationState {
  switch (action.type) {
    case "PAIRING_START":
      return {
        ...state,
        pairing: "streaming",
        errorMessage: undefined,
        turns: [
          ...state.turns,
          { kind: "pairing", source: "initial", slides: [], status: "streaming" },
        ],
      };

    case "RECOMMENDATION_START": {
      // 낙관적으로 추가된 빈 ChatTurn이 있으면 제거하고 PairingTurn으로 대체한다.
      const last = state.turns[state.turns.length - 1];
      const baseTurns =
        last?.kind === "chat" && last.answer === "" && last.status === "streaming"
          ? state.turns.slice(0, -1)
          : state.turns;

      return {
        ...state,
        chat: "streaming",
        errorMessage: undefined,
        turns: [
          ...baseTurns,
          {
            kind: "pairing",
            source: "recommendation",
            question: action.question,
            slides: [],
            status: "streaming",
          },
        ],
      };
    }

    case "PAIRING_SLIDE_START":
      return updateLastPairingTurn(state, (turn) => ({
        ...turn,
        slides: [...turn.slides, createSlide(action.imageUrl)],
      }));

    case "PAIRING_SLIDE_FIELD":
      return updateLastPairingTurn(state, (turn) =>
        updateLastSlide(turn, (slide) => ({
          ...slide,
          [action.field]: action.data,
        }))
      );

    case "PAIRING_SLIDE_COMMIT":
      return updateLastPairingTurn(state, (turn) => {
        const committedSlide: PairingSlideView = {
          imageUrl: action.payload.imageUrl,
          rank: String(action.payload.rank),
          name: action.payload.name,
          comment: action.payload.comment,
          reason: action.payload.reason,
          wine: action.payload.wine,
          isCommitted: true,
        };

        // start 프레임을 놓쳤어도 json은 권위값이므로 슬라이드를 보장한다.
        if (turn.slides.length === 0) {
          return { ...turn, slides: [committedSlide] };
        }
        return updateLastSlide(turn, () => committedSlide);
      });

    case "PAIRING_DONE":
      return {
        ...updateLastPairingTurn(state, (turn) => ({
          ...turn,
          status: "done",
        })),
        pairing: "done",
        chat: "idle",
      };

    case "PAIRING_ERROR":
      return {
        ...updateLastPairingTurn(state, (turn) => ({
          ...turn,
          status: "error",
          errorMessage: action.message,
        })),
        pairing: "error",
        chat: "idle",
        errorMessage: action.message,
      };

    case "CHAT_START":
      return {
        ...state,
        chat: "streaming",
        errorMessage: undefined,
        turns: [
          ...state.turns,
          { kind: "chat", question: action.question, answer: "", status: "streaming" },
        ],
      };

    case "CHAT_APPEND":
      return updateLastChatTurn(state, (turn) => ({
        ...turn,
        answer: turn.answer + action.chunk,
      }));

    case "CHAT_DONE":
      return {
        ...updateLastChatTurn(state, (turn) => ({ ...turn, status: "done" })),
        chat: "idle",
      };

    case "CHAT_ERROR":
      return {
        ...updateLastChatTurn(state, (turn) => ({
          ...turn,
          status: "error",
          errorMessage: action.message,
        })),
        chat: "error",
        errorMessage: action.message,
      };

    case "RESET":
      return initialConversationState;
  }
}

function createSlide(imageUrl: string): PairingSlideView {
  return {
    imageUrl,
    rank: "",
    name: "",
    comment: "",
    reason: "",
    wine: null,
    isCommitted: false,
  };
}

/** 마지막 pairing turn을 갱신한다. 없으면 상태를 그대로 반환한다(defensive). */
function updateLastPairingTurn(
  state: ConversationState,
  updater: (turn: PairingTurn) => PairingTurn
): ConversationState {
  return updateLastTurnOfKind(state, "pairing", updater);
}

/** 마지막 chat turn을 갱신한다. 없으면 상태를 그대로 반환한다(defensive). */
function updateLastChatTurn(
  state: ConversationState,
  updater: (turn: ChatTurn) => ChatTurn
): ConversationState {
  return updateLastTurnOfKind(state, "chat", updater);
}

function updateLastTurnOfKind<K extends ConversationTurn["kind"]>(
  state: ConversationState,
  kind: K,
  updater: (turn: Extract<ConversationTurn, { kind: K }>) => ConversationTurn
): ConversationState {
  const index = state.turns.findLastIndex((turn) => turn.kind === kind);
  if (index === -1) {
    return state;
  }

  const turns = [...state.turns];
  turns[index] = updater(
    turns[index] as Extract<ConversationTurn, { kind: K }>
  );
  return { ...state, turns };
}

function updateLastSlide(
  turn: PairingTurn,
  updater: (slide: PairingSlideView) => PairingSlideView
): PairingTurn {
  if (turn.slides.length === 0) {
    return turn;
  }

  const slides = [...turn.slides];
  slides[slides.length - 1] = updater(slides[slides.length - 1]);
  return { ...turn, slides };
}
