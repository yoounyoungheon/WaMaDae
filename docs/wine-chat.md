# `/wine/chat` 페어링·후속 대화 개발 문서

- 라우트: `web/src/app/wine/chat/page.tsx`
- 시안: `designs/enhanced_design_3_1.png`, `designs/enhanced_design_3_2.png`
- API: `api/mysom-wine-pairing.md` (`/pairing`, `/chat`, SSE)
- 기준 백엔드: `mysom-api-demo` `68a0cb7`

같은 세션에서 최초 페어링을 스트리밍하고, 완료 후 일반 질문 또는 AI가 분류한 재페어링을
이어서 보여준다.

## 페이지 구조와 RSC/RCC 경계

```text
WineChatPage [Server]  (page.tsx)
├─ PageHeader [Server]
└─ WinePairingChatView [Client]
   ├─ ConversationScroll
   │  ├─ PairingTurnSection → WineRecommendationCarousel → WineRecommendationSlide[]
   │  │     Front: rank/name/image/comment/reason (flip)
   │  │     Back:  vintage/도수/가격 + 테이스트(바디·당도·타닌·산도 0..5)
   │  └─ ChatAnswerBubble[]
   └─ ChatComposer (sticky)
```

- `page.tsx`는 Server Component, SSE/reducer/scroll/carousel/flip/composer만 Client다.

## 진입 snapshot과 세션 수명

`WinePairingSnapshot`(`version: 2, sessionId, wineIds, menuNames`)을 hydration 이후 읽는다.
- `sessionId`는 추출 단계부터 이어진 동일 UUID다(화면 진입 시 새 ID를 만들지 않는다).
- hydration 전에는 오류를 표시하지 않는다.
- snapshot 누락/invalid/legacy면 네트워크 요청 없이 "처음부터 다시 시작"(/wine/list)을 제공한다.
- 리로드 시 같은 세션으로 pairing POST를 자동 반복하면 중복 페어링이 생기므로,
  pairing 시작 시 `markWinePairingConsumed(sessionId)`로 소비 표시하고, 이미 소비된
  세션이면 자동 재호출 대신 "이미 진행한 추천" 안내를 보여준다.
- 서버에 pairing 조회/resume API가 없어 기존 stream 복원은 지원하지 않는다.

## 상태 소유권

| 상태 | 관리 |
| --- | --- |
| 진입 snapshot / 소비 표시 | sessionStorage (`workflow-snapshot-storage`) |
| turns · stream 진행 · committedPairingCount | view-local `useReducer` (`conversation.reducer`) |
| 입력 중 message | composer `useState` |
| slide index / flip | 각 UI 로컬 state |
| AbortController | controller hook `ref` |

SSE 원본은 Zustand/TanStack Query에 누적하지 않는다. reducer는 순수 상태 전이만 맡고,
fetch/stream iteration은 `use-wine-pairing-conversation` controller hook에 격리한다.

```ts
type ConversationState = {
  turns: (PairingTurn | ChatTurn)[];
  pairing: "idle" | "streaming" | "done" | "error";
  chat: "idle" | "streaming" | "error";
  committedPairingCount: number;
};
```

composer는 최초 pairing이 정상 종료되고 `committedPairingCount > 0`일 때만 활성화된다.

## Pairing BFF 흐름

```text
snapshot 복원 → markConsumed
→ POST /api/wine-pairings/pairing  (X-Session-Id, { wineIds, menuNames })
→ BFF: UUID/배열/길이/중복 검증, menuNames는 철자 그대로 전달(category 변환 금지)
→ POST /v1/wine-pairings/pairing (Accept: text/event-stream)
→ backend ReadableStream을 버퍼링 없이 pipe
   (Content-Type: text/event-stream, Cache-Control: no-store, X-Accel-Buffering: no)
→ client SSE parser → reducer
```

후속 chat도 동일 `X-Session-Id`로 `POST /api/wine-pairings/chat { message }`를 호출한다.

## SSE 해석 규칙 (reducer)

1. field `STREAM`(rank/name/comment/reason)은 마지막 미확정 slide를 만들거나 갱신한다.
2. 같은 `fieldName`의 `body`는 도착 순서로 append한다.
3. `hasNext: false`는 필드 완료 신호일 뿐 slide/stream 완료가 아니다.
4. `JSON`은 권위값이므로 미확정 slide를 통째로 교체하고 `committedPairingCount`를 늘린다.
5. 미확정 slide가 없어도 `JSON`만으로 committed slide를 만든다.
6. stream `done` 시 committed slide가 하나 이상이면 turn 완료, 하나도 없으면 오류다.

후속 chat 분기(controller):
- 첫 frame이 field name 없는 `STREAM`이면 일반 chat turn(답변 append).
- 첫 frame이 `JSON`이거나 `fieldName`이 있으면 낙관적 빈 chat turn을 pairing turn으로 대체.
- 알 수 없거나 잘못된 frame(모르는 fieldName, wine 없는 JSON)은 UI에 반영하지 않는다.

React key는 `pairingId + wine.id + rank`를 결합한다(pairingId는 slide마다 유일하지 않음).

## 와인 화면 모델

- 앞면 이미지는 `wineBottleImageUrl`, 없거나 로드 실패면 placeholder(`Wine` 아이콘).
- 뒷면 테이스트는 `body`/`sweetness`/`tannin`/`acid` 실제 값만 0..5로 그린다.
  null이면 "정보 없음"으로 두고 0으로 그리지 않는다.
- 현재 backend pairing mapper는 `body`를 누락하므로 body는 항상 null일 수 있다(정상 nullable).
- `acid`는 표시명 "산도"로 매핑하되 DTO field명은 바꾸지 않는다.
- 가격은 통화 단위/기호로 표시하고, 이름은 `wineName`을 그대로 쓴다(변종/풍미 추측 없음).

## 오류·재시도·동시성

- stream 시작 전 400/404/409는 safe message로 매핑한다.
- stream 도중 종료는 현재 turn을 error로 표시하고 부분 slide를 결과로 확정하지 않는다.
- 초기 pairing 실패에 같은 session/body를 자동 retry하지 않는다. 복구 CTA는 "처음부터
  다시 시작"(/wine/list)으로 새 세션을 만들게 한다.
- 일반 chat은 streaming 중 composer를 잠근다. chat 실패는 기존 pairing을 유지하고
  같은 메시지를 자동 재전송하지 않는다.
- unmount 시 AbortController로 모든 stream을 취소하고 이후 dispatch를 막는다.

## Storybook

- `Feature/wine-pairing-chat/WineRecommendationSlide` (streaming/committed/null taste/long)
- `WineRecommendationCarousel`, `ChatAnswerBubble`, `ChatComposer`
- `WinePairingChatView` (PairingDone/Streaming/Error/NoRequest) — fetch/sessionStorage 스텁

## 남은 제약

- backend가 pairing 응답의 `body`를 채우면 뒷면 바디 바가 자동으로 값을 표시한다(코드 변경 불필요).
- 새로고침 후 진행 중이던 stream 복원은 서버 계약이 없어 지원하지 않는다.
