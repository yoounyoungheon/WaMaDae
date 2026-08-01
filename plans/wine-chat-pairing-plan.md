# `/wine/chat` 와인 페어링 스트리밍 화면 개발 계획

## 1. 기준

- 대상 라우트: `web/src/app/wine/chat/page.tsx` (신규)
- 관련 디자인: `designs/p6.png`
- API 명세: `api/mysom-wine-pairing.md` + 백엔드 실제 구현
  - `mysom-api`: `feature/winepairing/command/controller/StreamController.kt`,
    `service/WinePairingSessionService.kt`, `dto/request/PairingStreamRequest.kt`
- 적용 가이드: `data-flow-layering`, `bff-api-gateway`, `rsc-rendering`, `rcc-rendering`,
  `css-only-state`(캐러셀), `style-implementation`, `storybook-authoring`

이 문서는 `/wine/chat` 한 라우트만 대상으로 한다.

## 2. 백엔드 계약 확정 (검증 결과)

### POST /v1/wine-pairing/stream/pairing (최초 진입 시 1회)

- Header: `X-Chat-Id`(필수, 공백 불가), `Content-Type: application/json`, `Accept: text/event-stream`
- Body: `{ wines: Array<{ id: number }>, menuCategories: string[] }`
  - `wines` 비어있을 수 없음, `wines[].id`는 `Long`(정수, null 불가)
  - `menuCategories` 비어있을 수 없음, 각 항목 공백 불가
- 응답: `text/event-stream`. 추천 1건당 아래 6 프레임을 rank 오름차순으로 반복 전송.

```text
data:{"fieldName":"imageUrl","type":"text","data":"...","status":"start","isStreaming":true}
data:{"fieldName":"rank","type":"text","data":"1","status":"painting","isStreaming":true}
data:{"fieldName":"name","type":"text","data":"...","status":"painting","isStreaming":true}
data:{"fieldName":"comment","type":"text","data":"...","status":"painting","isStreaming":true}
data:{"fieldName":"reason","type":"text","data":"...","status":"painting","isStreaming":true}
data:{"fieldName":"pairing","type":"json","data":{"imageUrl","rank","name","comment","reason","wine"},"status":"next","isStreaming":false}
```

- `pairing` json 프레임의 `data`가 해당 추천의 최종값(권위). `data.wine`에는 추천 와인의 상세 DB 정보가 포함된다. 전체 완료는 stream `done`.
- 오류: `400`(검증 실패 / 존재하지 않는 와인 ID / **이미 사용된 chatId**), `500`(스트림 시작 전).
- **한 chatId로 pairing은 1회만.** 같은 chatId 재요청 시 `400`("이미 페어링이 시작된 채팅 ID입니다.").

### POST /v1/wine-pairing/stream/chat (후속 채팅)

- Header: `X-Chat-Id`(필수, **해당 chatId로 pairing이 선행되어 있어야 함**), json, `Accept: text/event-stream`
- Body: `{ message: string }` (공백 불가)
- 응답: 일반 질문이면 텍스트 청크, 재추천 의도이면 페어링 추천 frame.

```text
data:{"fieldName":"chat","type":"text","data":"첫째 ","status":"painting","isStreaming":true}
data:{"fieldName":"chat","type":"text","data":"둘째","status":"painting","isStreaming":true}
```

- 일반 질문은 순서대로 `data`를 이어붙인다. 완료는 stream `done`.
- 재추천 응답은 `/stream/pairing`과 같은 `imageUrl`, `rank`, `name`, `comment`, `reason`, `pairing` frame을 반환할 수 있다.
- 오류: `400`(검증 실패 / 존재하지 않는 chatId).

### 확정된 설계 결정

1. **일반 채팅 응답 = 말풍선 누적, 재추천 응답 = 새 캐러셀 turn 추가.**
   최초 페어링 캐러셀 이후에도 사용자의 후속 메시지가 재추천으로 판단되면 추천 캐러셀이 한 번 더 추가될 수 있다.
2. **"추가적인 질문을 해보세요" 프리셋 질문 버튼: 이번 버전 제외.** 어떤 SSE에도 추천 질문
   데이터가 없고, 프리셋도 두지 않는다. 후속 질문은 하단 채팅 입력창으로만 받는다.
3. **상단 헤더(뒤로가기 바), 하단 푸터(홈/커뮤니티/마이페이지), "채팅으로 맞춤 질문을 해보세요!"
   헤딩은 제외.** 채팅 입력창은 유지(페어링 스트림 완료 후 활성화).

### 후속 채팅 분기 UI 결정

후속 질문을 보낸 직후에 질문 버블을 즉시 표시한다. 응답 종류는 첫 SSE frame을 보고 확정한다.

```text
sendChat(message)
-> CHAT_START(question=message)   // 질문 버블 즉시 노출 (낙관적 UI)
-> streamWinePairingChat 시작
-> 첫 frame 확인
   -> fieldName === "chat"
      -> turnKind = "chat"
      -> CHAT_APPEND(chunk)
   -> fieldName !== "chat"
      -> turnKind = "pairing"
      -> RECOMMENDATION_START(question=message)  // 빈 ChatTurn 제거 후 PairingTurn 추가
      -> PAIRING_* 액션 재사용
```

`RECOMMENDATION_START`는 직전에 `CHAT_START`로 추가된 빈 ChatTurn(`answer === ""`, `status === "streaming"`)을 제거한 뒤 PairingTurn으로 대체한다. 이 정책으로 사용자가 보낸 질문은 일반 답변과 재추천 응답 모두에서 화면에 남는다.

## 3. 진입 흐름 (`/wine/keywords` → `/wine/chat`)

`/wine/keywords`의 하단 "와인 추천받기" 버튼(현재 스타일만 있고 onClick 없음)에 동작을 연결한다.

```text
와인 추천받기 클릭
-> buildWinePairingRequest(storedRequest.wines, selectedCategories)
   - wines: storedRequest.wines 의 id(string) -> number 변환, 정수만 통과 -> [{ id }]
   - menuCategories: selectedCategories(이름 문자열)
-> saveWinePairingRequest({ wines, menuCategories })   [sessionStorage 스냅샷]
-> router.push("/wine/chat")
```

- 버튼 비활성화 조건: 선택된 카테고리 0개 이거나, 정수 id를 가진 와인이 0개.
- `chatId`는 스냅샷에 저장하지 않는다(아래 4-3 참고).

## 4. 페이지 구조와 RSC/RCC 경계

### 4-1. 구조

```text
WineChatPage [Server]  (wine/chat/page.tsx)
└─ WinePairingChatView [Client]  "use client"
   ├─ 대화 스크롤 영역 (min-h-0 flex-1 overflow-y-auto)
   │  ├─ PairingTurn
   │  │  ├─ "마이쏨이 추천하는 와인이에요!" 타이틀
   │  │  └─ WineRecommendationCarousel   # N 슬라이드 + dots
   │  │     └─ WineRecommendationSlide[]
   │  └─ ChatTurn[]                       # 스트리밍 텍스트 답변 말풍선
   │     └─ ChatAnswerBubble
   └─ 하단 sticky composer (shrink-0)
      └─ ChatComposer                     # 입력창 + 전송 버튼(페어링 완료 후 활성화)
```

- 상단 네비 헤더(뒤로가기 바)는 두지 않는다(확정). `page.tsx`는 Server Component로 두고
  콘텐츠 첫 요소가 타이틀.
- `/wine/chat`는 `/wine/layout.tsx`(WineListSelectionProvider) 아래지만 선택 store에
  의존하지 않고 sessionStorage 스냅샷만 읽는다.

### 4-2. 상태 관리 (data-flow-layering 준수)

| 상태 | 출처 | 관리 방식 |
| --- | --- | --- |
| 페어링 요청(wines, menuCategories) | `/wine/keywords`가 저장한 스냅샷 | sessionStorage |
| chatId | 클라이언트 생성 | 뷰 마운트 시 1회 생성(useRef) |
| 대화(turns: 캐러셀/채팅 답변) | SSE 스트림 | 뷰 로컬 `useReducer` |
| 스트리밍 상태(pairing/chat) | SSE 진행 | 같은 reducer의 상태 필드 |
| 입력 중 메시지 | 컴포넌트 내부 | `useState` |

도구 선택 근거:

- SSE 수신 데이터는 **Zustand/TanStack Query에 원본 누적하지 않는다**(가이드 명시). 점진적으로
  쌓이고 캐시 대상이 아니며 이 화면 밖에서 공유하지 않으므로, 전역 store가 아니라 **뷰 로컬
  `useReducer`** 하나로 대화를 관리한다.
- 이 화면에서는 Zustand와 TanStack Query를 사용하지 않는다.
  (`/wine/layout`의 `WineListSelectionProvider`도 이 페이지에서는 참조하지 않는다.)
- 페어링 요청 스냅샷만 sessionStorage에 두어 WebView 리로드 시 재-페어링이 가능하게 한다
  (기존 `recommendation-request-storage` 패턴과 동일).

reducer state shape:

```ts
type ConversationState = {
  turns: Turn[];                                 // 캐러셀 turn + 채팅 turn 순서대로
  pairing: "idle" | "streaming" | "done" | "error";
  chat: "idle" | "streaming" | "error";
  errorMessage?: string;
};
```

순수 로직 / 이펙트 분리:

- **reducer는 순수 함수**로, `fieldName`·`type`에서 파생된 액션(7절)만 계산한다(단위 테스트 가능).
- **부수효과는 컨트롤러 훅**(`use-wine-pairing-conversation.ts`)에 격리한다. 스트림
  (async generator)을 읽어 프레임마다 `dispatch`한다.
- 흐름: "네트워크 스트림 읽기(이펙트) → `dispatch` → 순수 reducer가 다음 UI 상태 계산" 단방향.

파생 상태(별도 저장하지 않고 reducer 상태에서 계산):

```ts
const isPairingDone = state.pairing === "done";
const isStreaming = state.pairing === "streaming" || state.chat === "streaming";
const isComposerEnabled = isPairingDone && state.chat !== "streaming";
```

- 입력창 활성화("모두 그리면 입력 가능")와 전송 잠금(스트리밍 중 중복 방지)은 위 파생값으로 결정한다.
- 기존 상태에서 계산 가능한 값은 중복 상태로 저장하지 않는다.

렌더 범위:

- `turns` 배열은 컨트롤러 훅이 소유하고 `WinePairingChatView`가 구독한다. 각
  `WineRecommendationCarousel`/`ChatAnswerBubble`에는 필요한 turn만 props로 전달해 불필요한
  리렌더를 줄인다.

### 4-3. chatId 수명 정책

- 백엔드는 한 chatId로 pairing 1회만 허용(재요청 시 400), chat은 pairing 선행 chatId 필요.
- 따라서 **chatId는 스냅샷에 저장하지 않고 뷰 마운트 시 `crypto.randomUUID()`로 1회 생성**한다.
  - 최초 마운트: 새 chatId로 pairing → 이후 모든 chat은 같은 chatId 사용.
  - 리로드: 새 chatId로 wines+menuCategories 스냅샷을 다시 페어링(신규 대화). 과거 채팅 이력은
    복원하지 않는다(스트림은 인메모리). → 재-페어링 400 회피.
- React StrictMode 이중 실행 대비: pairing 시작은 `useRef` 가드로 1회만 POST.
- 언마운트/이탈 시 `AbortController`로 진행 중 스트림을 취소하고 이후 `dispatch`를 중단한다.

## 5. BFF 설계 (스트리밍 프록시)

브라우저는 same-origin `/api/*`만 호출하고 백엔드 origin은 숨긴다(bff-api-gateway).

### 신규 Route Handler

```text
web/src/app/api/wine-pairing/stream/pairing/route.ts   (POST)
web/src/app/api/wine-pairing/stream/chat/route.ts       (POST)
```

공통 책임:

- `export const dynamic = "force-dynamic"`, `runtime = "nodejs"` (스트리밍).
- JSON body와 `X-Chat-Id`(공백 불가)를 검증한다.
  - pairing: `wines` 1개 이상, 각 `id` 정수(number); `menuCategories` 1개 이상, 각 공백 아님.
  - chat: `message` 공백 아님.
- server-only 헬퍼로 백엔드 스트림을 열고, 백엔드 `Response.body`(ReadableStream)를 그대로
  파이프해 `text/event-stream`으로 반환한다.
  - 응답 헤더: `Content-Type: text/event-stream`, `Cache-Control: no-store`,
    `Connection: keep-alive`, `X-Accel-Buffering: no`.
- 스트림 시작 전 백엔드가 비-200(400/500)이면 스트림 대신 safe JSON 오류로 변환.
- 백엔드 origin/에러 body/stack을 노출하지 않는다.
- `X-Chat-Id`는 브라우저 요청 body/헤더에서 받아 백엔드 헤더로만 재구성(요청 헤더 통짜 전달 금지).

### server-only 헬퍼

```text
web/src/app/entity/wine-pairing/api/wine-pairing.server.ts
```

- `openWinePairingStream(request, chatId): Promise<Response>`
- `openWinePairingChatStream(request, chatId): Promise<Response>`
- `buildMysomApiUrl("/v1/wine-pairing/stream/...")`, `cache: "no-store"`,
  `Accept: text/event-stream`, `X-Chat-Id` 헤더. 스트림이므로 timeout은 길게/abort signal 연동.
- 성공 시 백엔드 `Response`를 반환(라우트가 body/status를 파이프). 실패 시 status를 담은 오류.

## 6. Entity 계층

```text
web/src/app/entity/wine-pairing/
├─ model/wine-pairing.type.ts
├─ lib/
│  ├─ build-wine-pairing-request.ts        # Wine[] 파생 요청 순수 변환
│  └─ wine-pairing-request-storage.ts       # sessionStorage 스냅샷 저장/복원/검증
└─ api/
   ├─ wine-pairing.api.ts                    # 브라우저 BFF 호출(스트림 파서 연동)
   └─ wine-pairing.server.ts                 # server-only 백엔드 스트림 오픈
```

타입:

```ts
type WinePairingRequest = { wines: Array<{ id: number }>; menuCategories: string[] };
type WinePairingChatBody = { message: string };

// 앱 모델(슬라이드)
type PairingStreamWine = {
  id: string;
  name: string;
  koreanName: string | null;
  area: string | null;
  category: string | null;
  price: number | null;
  imagePath: string | null;
  rating: string | null;
  country: string | null;
  region: string | null;
  grape: string | null;
  vintage: number | null;
  alcohol: number | null;
  body: number | null;
  sweetness: number | null;
  tannin: number | null;
  acidity: number | null;
};

type PairingSlide = {
  imageUrl: string; rank: number; name: string; comment: string; reason: string; wine: PairingStreamWine;
};

// SSE 프레임 DTO
type PairingStreamEvent =
  | { fieldName: "imageUrl"; type: "text"; data: string; status: "start"; isStreaming: true }
  | { fieldName: "rank" | "name" | "comment" | "reason"; type: "text"; data: string; status: "painting"; isStreaming: true }
  | { fieldName: "pairing"; type: "json"; data: PairingSlide; status: "next"; isStreaming: false };
type ChatStreamEvent = { fieldName: "chat"; type: "text"; data: string; status: "painting"; isStreaming: true };
type PairingChatStreamEvent = ChatStreamEvent | PairingStreamEvent;
```

- `wine-pairing.api.ts`: `streamWinePairing(request, chatId, signal)`,
  `streamWinePairingChat(body, chatId, signal)` — `/api/wine-pairing/stream/*`를 fetch하고
  `parseSseStream`으로 파싱한 이벤트를 `AsyncGenerator`로 yield.
- SSE 파서는 공용으로 둔다: `web/src/app/shared/lib/sse/parse-sse-stream.ts`
  (ReadableStream<Uint8Array> → `data:` 프레임 JSON 파싱 async generator).

## 7. Feature 계층

```text
web/src/app/feature/wine-pairing-chat/
├─ model/
│  ├─ conversation.types.ts                 # Turn 유니온 타입
│  └─ conversation.reducer.ts               # 순수 reducer + actions
├─ api/
│  └─ use-wine-pairing-conversation.ts      # 컨트롤러 훅(reducer + 스트리밍 액션 + chatId)
└─ ui/
   ├─ WinePairingChatView.tsx (+ stories)
   ├─ WineRecommendationCarousel.tsx (+ stories)
   ├─ WineRecommendationSlide.tsx (+ stories)
   ├─ ChatAnswerBubble.tsx (+ stories)
   ├─ ChatComposer.tsx (+ stories)
   └─ wine-pairing-chat.props.ts
```

Turn 모델:

```ts
type Turn =
  | {
      kind: "pairing";
      source: "initial" | "recommendation";
      question?: string;
      slides: PairingSlide[];
      status: "streaming" | "done" | "error";
      errorMessage?: string;
    }
  | { kind: "chat"; question: string; answer: string; status: "streaming" | "done" | "error"; errorMessage?: string };
```

### SSE 렌더링 규칙 (백엔드 협의 기준)

각 SSE 이벤트를 `fieldName`과 `type`으로 해석해 "부분을 그리다가 마지막에 통째로 교체"한다.

- `fieldName`으로 슬라이드의 **어느 부분을 그릴지** 결정한다.
- `type: "text"` 프레임 → 해당 `fieldName` 필드를 **점진적으로 채워** 동적으로 생성되는 것처럼 보여준다.
  - `imageUrl`은 `status: "start"`로 오며 **새 추천(슬라이드) 인스턴스의 시작 신호**다. 새 슬라이드
    스켈레톤을 만들고 imageUrl 부분부터 그린다.
  - `rank`/`name`/`comment`/`reason`은 `status: "painting"`으로 각 필드를 갱신한다(페인팅 효과).
- `type: "json"`(`fieldName: "pairing"`) 프레임 → 그 슬라이드 **전체를 최종 payload로 replace**한다.
  중간 text 값과 다를 수 있으므로 이 json이 항상 권위값이다.

후속 채팅 스트림은 두 갈래다.

- `fieldName: "chat"`이면 현재 말풍선 텍스트를 이어붙인다.
- `fieldName`이 `imageUrl`/`rank`/`name`/`comment`/`reason`/`pairing`이면 재추천 응답으로 보고 새 pairing turn에 같은 SSE 렌더링 규칙을 적용한다.

reducer 액션(위 규칙의 순수 구현, 단위 테스트 가능):

- `PAIRING_START` → 최초 빈 pairing turn 추가(`source: "initial"`, status streaming)
- `RECOMMENDATION_START(question)` → 후속 질문용 빈 pairing turn 추가(`source: "recommendation"`, question 포함, status streaming)
- `PAIRING_SLIDE_START`(imageUrl/text/start) → 현재 pairing turn에 새 슬라이드 스켈레톤 push
- `PAIRING_SLIDE_FIELD`(rank|name|comment|reason/text/painting) → 마지막 슬라이드의 해당 필드 갱신
- `PAIRING_SLIDE_COMMIT`(pairing/json) → 마지막 슬라이드를 최종 payload로 replace(권위값)
- `PAIRING_DONE` / `PAIRING_ERROR`
- `CHAT_START`(question) → chat turn 추가(answer "", streaming)
- `CHAT_APPEND`(chunk) → 마지막 chat turn answer에 이어붙임
- `CHAT_DONE` / `CHAT_ERROR`

컨트롤러 훅 `use-wine-pairing-conversation.ts`:

- 마운트 시 스냅샷 로드 → 없으면 `hasRequest=false`(빈 상태 안내).
- `chatId`는 useRef로 1회 생성. 마운트 시 pairing 스트림 시작(StrictMode 가드).
- `sendChat(message)`: pairing 완료(`isPairingDone`) 상태에서만 허용. `CHAT_START`를 즉시 dispatch해 질문 버블을 낙관적으로 표시하고, 첫 SSE frame으로 ChatTurn/PairingTurn을 확정한다.
- 스트리밍 중(pairing 또는 chat) 입력/전송 잠금. `isComposerEnabled = isPairingDone && !isChatStreaming`.
- 반환: `turns`, `isPairingDone`, `isStreaming`, `hasRequest`, `sendChat`, `errorMessage`.

## 8. 파일별 구현 계획

```txt
web/src/app/entity/wine-pairing/model/wine-pairing.type.ts
web/src/app/entity/wine-pairing/api/wine-pairing.api.ts
web/src/app/entity/wine-pairing/api/wine-pairing.server.ts
web/src/app/api/wine-pairing/stream/pairing/route.ts
web/src/app/api/wine-pairing/stream/chat/route.ts
web/src/app/feature/wine-pairing-chat/model/conversation.types.ts
web/src/app/feature/wine-pairing-chat/model/conversation.reducer.ts
web/src/app/feature/wine-pairing-chat/api/use-wine-pairing-conversation.ts
web/src/app/feature/wine-pairing-chat/ui/WinePairingChatView.tsx
web/src/app/feature/wine-pairing-chat/ui/WineRecommendationSlide.tsx
web/src/app/feature/wine-pairing-chat/ui/WineRecommendationCarousel.tsx
```

### `wine-pairing.type.ts`

- `PairingSlidePayload`에 `wine: PairingStreamWine`을 추가한다.
- `PairingStreamWine`은 백엔드 상세 필드를 모두 보존한다.
- `ChatStreamEvent`는 `chat` text event만 표현한다.
- `PairingChatStreamEvent = ChatStreamEvent | PairingStreamEvent`를 추가한다.
- `streamWinePairingChat`의 반환 타입은 `AsyncGenerator<PairingChatStreamEvent, void, undefined>`가 되어야 한다.

### `wine-pairing.api.ts`

- `streamWinePairing`은 기존처럼 `PairingStreamEvent`를 yield한다.
- `streamWinePairingChat`은 `PairingChatStreamEvent`를 yield한다.
- `parseSseStream` 단계에서 알 수 없는 frame은 파서가 아니라 컨트롤러/mapper 계층에서 무시한다.

### BFF Route Handlers

- `/api/wine-pairing/stream/pairing/route.ts`와 `/api/wine-pairing/stream/chat/route.ts`는 백엔드 SSE body를 버퍼링하지 않고 그대로 pipe한다.
- chat route는 재추천 frame을 알 필요가 없다. BFF는 validation, safe error, stream pipe만 담당한다.
- 백엔드 `400`은 safe message로 변환하고, 백엔드 오류 body를 노출하지 않는다.

### Reducer/Controller

- `conversation.types.ts`의 `PairingTurn`에 `source`와 optional `question`을 추가한다.
- `PAIRING_START`는 `source: "initial"`을 설정한다.
- `RECOMMENDATION_START`는 `source: "recommendation"`과 질문을 설정한다.
- `sendChat`은 `CHAT_START(message)`를 즉시 dispatch해 질문 버블을 낙관적으로 노출한다.
- 첫 `chat` event가 오면 `turnKind = "chat"`으로 확정 후 `CHAT_APPEND`.
- 첫 pairing event가 오면 `RECOMMENDATION_START(message)`를 dispatch한다. 이 시점에 reducer가 앞서 추가된 빈 ChatTurn을 제거하고 PairingTurn으로 대체한다. 이후 `mapPairingEventToAction` 결과를 dispatch한다.
- 같은 chat 응답 안에서 `chat` event와 pairing event가 섞이면 오류로 보지 않고 이미 확정된 응답 종류와 맞지 않는 event는 무시한다.
- 재추천 스트림 완료 시 pairing turn은 `done`, chat 상태는 `idle`로 돌아간다.

### UI

- `WinePairingChatView`는 `turn.kind === "pairing"`일 때 `turn.question`이 있으면 캐러셀 위에 사용자 질문을 표시한다.
- 최초 추천(`source: "initial"`)은 기존 제목 `마이쏨이 추천하는 와인이에요!`를 유지한다.
- 재추천(`source: "recommendation"`)은 같은 캐러셀 컴포넌트를 쓰되, 필요하면 제목을 `다시 추천해드릴게요.`로 분기한다.
- `WineRecommendationSlide`는 당장 화면에 쓰지 않더라도 `payload.wine`을 props/model에서 손실하지 않는다.

## 9. 데이터 흐름

```text
[/wine/keywords] 와인 추천받기
-> saveWinePairingRequest({ wines:[{id}], menuCategories })
-> push /wine/chat

[/wine/chat] WinePairingChatView 마운트
-> loadWinePairingRequest()  (없으면 빈 상태)
-> chatId = randomUUID()
-> streamWinePairing(request, chatId) → fetch POST /api/wine-pairing/stream/pairing
   -> BFF 검증 → openWinePairingStream → POST /v1/wine-pairing/stream/pairing
   -> parseSseStream → 프레임마다 reducer dispatch(페인팅 → 슬라이드 확정)
   -> stream done → PAIRING_DONE → composer 활성화

[채팅 입력 전송] sendChat(message)
-> streamWinePairingChat({message}, chatId) → POST /api/wine-pairing/stream/chat
   -> fieldName="chat"이면 CHAT_APPEND
   -> pairing 계열 frame이면 새 pairing turn을 만들고 페어링 SSE 액션 재사용
   -> done → CHAT_DONE 또는 PAIRING_DONE → 다음 입력 가능
```

## 10. UI 설계 (designs/p6.png)

### WineRecommendationSlide (캐러셀 1장)

- 보라 그라디언트 카드(rounded-2xl), 좌상단 와인 이미지(정사각 rounded, `imageUrl` 없으면 placeholder).
- `{rank}순위` 흰색 pill 배지.
- 와인명(굵게, 흰색, 큰 글씨) — 넘치면 말줄임/줄바꿈 정책 적용.
- "와마대 한줄평" 라벨 + `comment`(굵게, 흰색).
- "추천 이유" 라벨 + `reason`(흰색, 여러 줄).
- 필드 매핑 확정: `comment` → 와마대 한줄평, `reason` → 추천 이유.
- **와인 상세 플립**: `slide.isCommitted && slide.wine !== null` 조건이 되면(SSE 완료 후) 카드 상단 우측에 "와인 상세" 텍스트 버튼 노출. 클릭 시 카드가 3D flip되어 뒷면에 `slide.wine` 메타데이터를 표시한다. 상세는 §16 참조.

### WineRecommendationCarousel

- 가로 스크롤 스냅(css-only-state 우선: `overflow-x-auto snap-x snap-mandatory`, 각 슬라이드 `snap-center`).
- 하단 dots 인디케이터(슬라이드 수만큼). 활성 dot 강조.
- 가로 스크롤만, 세로 페이지 스크롤과 충돌 않도록 `overscroll-contain`.
- 스트리밍 중 페인팅되는 첫 슬라이드도 자연스럽게 노출.

### ChatAnswerBubble

- 스트리밍 텍스트 답변(청크 이어붙임)을 **말풍선(스피치 버블)** 스타일로 표시.
  좌측 정렬 어시스턴트 말풍선(rounded), 스트리밍 중 커서/타이핑 인디케이터 선택.

### ChatComposer (하단 sticky)

- 라운드 입력 + 원형 전송 버튼(보라). 페어링 완료 전/스트리밍 중 비활성.
- Enter 전송, 빈 문자열 전송 방지.

### shared/ui 재사용

- `shared/ui/atom/button`, `shared/ui/atom/loading-spinner`, `shared/ui/atom/text-input`(입력창).
- 캐러셀/슬라이드/말풍선은 도메인 특화 표현이라 feature 내부. 공용화 후보는 구현 중 판단.

## 11. Storybook 계획

- `WineRecommendationSlide`: Default, LongText, NoImage, StreamingPainting, WithWineDetail(플립 버튼 노출 상태)
- `WineRecommendationCarousel`: SingleSlide, ThreeSlides, StreamingPainting
- `ChatAnswerBubble`: Streaming, Done
- `ChatComposer`: Disabled(페어링 전), Enabled, Sending
- `WinePairingChatView`: PairingStreaming, PairingDone, WithChatAnswer, WithRecommendationAgain, NoRequest, PairingError
  - 실제 네트워크 없이 `fetch`를 SSE 스텁(ReadableStream 반환)으로 재현. Story별 sessionStorage
    스냅샷 seed + cleanup. QueryClient는 이 화면에서 미사용.

## 12. 구현 순서

1. 공용 SSE 파서(`shared/lib/sse/parse-sse-stream.ts`) 작성 + 단위 확인.
2. Entity 타입 / `build-wine-pairing-request` / `wine-pairing-request-storage` 작성.
3. server-only 스트림 헬퍼 + BFF Route Handler 2개(pairing/chat) 작성, curl로 스트림 확인.
4. 브라우저 api(`streamWinePairing`, `streamWinePairingChat`) 작성. `streamWinePairingChat`은 `chat` text event와 pairing event를 모두 yield한다.
5. reducer + 컨트롤러 훅(`use-wine-pairing-conversation`) 작성. 후속 채팅에서 pairing event가 오면 새 추천 캐러셀 turn으로 라우팅한다.
6. UI 컴포넌트(Slide/Carousel/AnswerBubble/Composer/View) 작성.
7. `/wine/chat/page.tsx`(Server) 작성 + 뷰 연결.
8. `/wine/keywords` "와인 추천받기" 버튼 onClick 연결(스냅샷 저장 + 이동).
9. Storybook 상태별 Story 작성.
10. 구현 후 `docs/wine-chat-pairing.md` 작성.

## 13. 검증

```bash
npx tsc --noEmit
npm run build
npm run build-storybook
```

추가 확인:

- 최초 진입 시 `/api/wine-pairing/stream/pairing`가 1회만 호출(StrictMode 가드).
- SSE 프레임 순서대로 슬라이드가 페인팅되고 `pairing` json으로 확정되는지.
- 페어링 완료 후에만 채팅 입력창이 활성화되는지.
- 채팅 전송 시 텍스트 답변 카드가 스트리밍으로 누적되는지.
- 채팅 전송 후 재추천 frame이 오면 새 캐러셀 turn이 추가되고 `pairing.data.wine` 상세 객체를 보존하는지.
- 잘못된 스냅샷/빈 진입 시 안전한 빈 상태를 보여주는지.
- BFF가 백엔드 origin/에러 body를 노출하지 않고 400/500을 safe 처리하는지.
- 리로드 시 새 chatId로 재-페어링되며 400이 나지 않는지.
- 가로 캐러셀 스크롤이 세로 스크롤과 충돌하지 않는지.

## 14. 완료 기준

- `/wine/chat/page.tsx`는 Server Component, 스트리밍 로직은 Client 경계 내.
- 브라우저는 same-origin `/api/wine-pairing/stream/*`만 호출.
- 최초 진입 시 페어링 SSE로 캐러셀(N 슬라이드)을 점진 렌더.
- 페어링 완료 후 채팅 입력 가능, 일반 채팅 응답은 말풍선으로 대화에 누적.
- 후속 채팅의 재추천 응답은 새 추천 캐러셀 turn으로 렌더링된다.
- `pairing.data.wine` 상세 객체가 타입과 reducer payload에서 손실되지 않는다.
- SSE 데이터는 Zustand/TanStack Query에 원본 저장하지 않음(뷰 로컬 reducer).
- 페어링 요청 스냅샷은 sessionStorage, chatId는 뷰에서 생성.
- 상단 헤더 / 푸터 / "채팅으로 맞춤 질문을 해보세요!" 헤딩 / 프리셋 질문 버튼 제외, 채팅 입력창 유지.

## 16. 기능 추가: 와인 상세 카드 플립

### 개요

SSE 스트림이 완료되어 슬라이드가 확정(`isCommitted: true`)되고 `wine` 데이터가 존재하면, 카드 상단 우측에 "와인 상세" 텍스트 버튼을 표시한다. 클릭 시 카드가 CSS 3D flip되어 뒷면에 `PairingStreamWine` 메타데이터를 보여준다.

### 변경 파일

```txt
web/src/app/feature/wine-pairing-chat/ui/WineRecommendationSlide.tsx  (메인 변경)
web/src/app/feature/wine-pairing-chat/ui/WineRecommendationSlide.stories.tsx
```

reducer/types/API 계층 변경 없음. `slide.wine`은 이미 `PAIRING_SLIDE_COMMIT`에서 보존된다.

### 플립 조건

```ts
const canFlip = slide.isCommitted && slide.wine !== null;
```

스트리밍 중(`isCommitted: false`)이거나 `wine`이 null이면 버튼 미노출.

### 컴포넌트 구조

```
<article>  (relative, pt-7)
  <span> 와인 이미지 원형 (absolute) </span>
  <div [perspective:1000px]>
    <div [transform-style:preserve-3d] transition-transform duration-500
         (isFlipped → [transform:rotateY(180deg)])>
      ── 앞면 ──
      <div [backface-visibility:hidden] min-h-[220px] gradient-card>
        <div flex justify-between pt-10 px-5>
          <span> N순위 pill </span>
          {canFlip && <button "와인 상세" onClick={() => setIsFlipped(true)}>}
        </div>
        <h3> 와인명 </h3>
        <p> 한줄평 / 추천 이유 </p>
      </div>
      ── 뒷면 ──
      <div absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]
           rounded-2xl bg-white min-h-[220px]>
        (아래 §16-뒷면 참조)
      </div>
    </div>
  </div>
</article>
```

`isFlipped`는 `WineRecommendationSlide` 내부 `useState(false)`. 슬라이드별 독립 상태.

### 뒷면 구성 (PairingStreamWine 메타데이터)

```
bg-white rounded-2xl px-5 py-6 min-h-[220px] flex flex-col
┌──────────────────────────────────────┐
│ [돌아가기]                (top-right) │  ← text-xs text-primary-main underline
│ koreanName || name        (lg bold)  │
│ category · country        (xs gray)  │
├──────────────────────────────────────┤
│ 지역   region                        │
│ 품종   grape                         │
│ 빈티지 vintage    도수 alcohol%      │
│ 평점   ★ rating                      │
├──────────────────────────────────────┤
│ 바디   ■■■□□   (1-5 bar)            │
│ 당도   ■□□□□                        │
│ 타닌   ■■■□□                        │
│ 산도   ■■□□□                        │
└──────────────────────────────────────┘
```

- null 필드는 렌더 생략.
- 1-5 bar: 정수 값 기준으로 채워진 칸(bg-primary-main)과 빈 칸(bg-main-gray-200) 5개 렌더.

### CSS 3D 플립 (Tailwind arbitrary value)

```tsx
// 외부 perspective wrapper
<div className="[perspective:1000px]">
  {/* flipper */}
  <div className={cn(
    "relative transition-transform duration-500 [transform-style:preserve-3d]",
    isFlipped && "[transform:rotateY(180deg)]"
  )}>
    {/* 앞면 */}
    <div className="[backface-visibility:hidden]"> ... </div>
    {/* 뒷면 */}
    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
      ...
    </div>
  </div>
</div>
```

### Storybook 추가 스토리

- `WithWineDetail`: `isCommitted: true`, `wine` 객체 채워진 상태 → "와인 상세" 버튼 표시 확인.

### 완료 기준

- `isCommitted: false` 또는 `wine: null`이면 "와인 상세" 버튼 미노출.
- 버튼 클릭 시 0.5s 3D flip 애니메이션.
- 뒷면에 `wine` 메타 데이터 정상 노출, null 필드 생략.
- "돌아가기" 클릭 시 앞면으로 복귀.
- 캐러셀 슬라이드별 플립 상태 독립 유지.

## 15. 미정 항목(구현 전/중 확인)

- 캐러셀 슬라이드 폭/여백, 말풍선 색상 등 디자인 상세 토큰(구현 중 `designs/p6.png` 기준 확정).
- 스트림 중단(사용자 이탈) 시 AbortController 취소 정책.
