# `/wine/chat` 세션 기반 페어링·후속 대화 설계

## 1. 범위와 기준

- 대상 라우트: `web/src/app/wine/chat/page.tsx`
- 화면 시안: `designs/enhanced_design_3_1.png`, `designs/enhanced_design_3_2.png`
- API 명세: `api/mysom-wine-pairing.md`의 `/pairing`, `/chat`
- 기준 백엔드: `mysom-api-demo` `68a0cb7`
- 적용 가이드: `web/GUIDE.md`, `data-flow-layering`, `bff-api-gateway`, `rsc-rendering`, `rcc-rendering`, `storybook-authoring`
- 범위: 설계만 작성하며 코드는 변경하지 않는다.

이 페이지는 같은 session 안에서 최초 페어링을 스트리밍하고, 완료 뒤 일반 질문 또는 AI가 분류한 재페어링을 이어서 보여준다.

## 2. 변경 계약과 현재 구현 차이

| 구분 | 현재 프론트 | 변경 계약 | 설계 결정 |
| --- | --- | --- | --- |
| backend path | `/v1/wine-pairing/stream/*` | `/v1/wine-pairings/pairing`, `/chat` | 새 path 사용 |
| session | chat 화면에서 `chatId` 생성 | 추출부터 이어진 `X-Session-Id` UUID | snapshot ID 재사용 |
| pairing body | `wineIds + menuCategories[{name}]` | `wineIds + menuNames[]` | 추천 menu name 문자열 전달 |
| wine detail | 제한 필드 | taste profile + bottle image | 실제 값으로 상세 카드 구성 |
| SSE | `STREAM | JSON` | envelope 유지 | runtime validator 강화 |

화면 진입 때 새 ID를 만들면 backend session을 찾지 못하므로 금지한다. `/wine/keywords`가 저장한 `sessionId`를 pairing과 모든 chat 요청에서 그대로 사용한다.

## 3. 페이지 구조와 RSC/RCC 경계

```text
WineChatPage [Server]
├─ PageHeader [Server]
└─ WinePairingChatView [Client]
   ├─ ConversationScrollArea
   │  ├─ IntroSection
   │  ├─ PairingTurnSection[]
   │  │  └─ WineRecommendationCarousel
   │  │     └─ WineRecommendationSlide[]
   │  │        ├─ Front: rank/name/image/comment/reason
   │  │        └─ Back: metadata + taste profile
   │  ├─ ChatTurn[]
   │  └─ StreamErrorPanel
   └─ ChatComposer
```

- `page.tsx`는 Server Component를 유지한다.
- SSE, reducer, scroll, carousel, flip, composer만 Client Component 경계에 둔다.
- `PageHeader`, `Button`, `Card`, `LoadingSpinner`, `TextArea`를 `shared/ui`에서 우선 재사용한다.
- feature는 `shared/ui/shadcn`을 직접 import하지 않는다.

## 4. 진입 snapshot과 세션 수명

```ts
type WinePairingSnapshotV2 = {
  version: 2;
  sessionId: string;
  wineIds: string[];
  menuNames: string[];
};
```

- 세 값은 하나의 versioned snapshot에서 복원한다.
- `wineIds`는 현재 session 추출 응답의 ID, `menuNames`는 같은 session의 최신 추천 응답 name이다.
- hydration 전에는 요청 없음 오류를 표시하지 않는다.
- snapshot 누락/invalid/legacy shape이면 network 요청 없이 `/wine/list` 재시작 액션을 표시한다.
- browser reload에도 같은 session을 사용하지만 pairing POST를 자동 반복하면 중복 페어링이 생길 수 있다. 따라서 `pairingStartedAt` 또는 `pairingCompleted` 상태가 남은 snapshot은 자동 재호출하지 않고 “새 추천 시작” 안내를 제공한다.

서버에는 현재 pairing 조회/resume API가 없다. 새로고침 후 기존 stream 복원은 지원하지 않는 것으로 명시한다.

## 5. 상태 소유권

| 상태 | 관리 방식 | 근거 |
| --- | --- | --- |
| 요청 snapshot | sessionStorage | 페이지 이동/리로드 handoff |
| turns와 stream 진행 | view-local `useReducer` | SSE 수신 데이터, 화면 밖 공유 없음 |
| 입력 중 message | composer `useState` | 단일 컴포넌트 임시 상태 |
| slide index/flip | 각 UI 로컬 state | 국소 상호작용 |
| 연결/AbortController | controller hook ref | 렌더링 데이터 아님 |

SSE 원본을 Zustand나 TanStack Query에 누적하지 않는다. reducer는 순수 상태 전이만 맡고 fetch/stream iteration은 controller hook에 격리한다.

```ts
type ConversationState = {
  turns: Array<PairingTurn | ChatTurn>;
  pairing: "idle" | "streaming" | "done" | "error";
  chat: "idle" | "streaming" | "error";
  committedPairingCount: number;
  errorMessage?: string;
};
```

composer는 최초 pairing stream이 정상 종료되고 `committedPairingCount > 0`일 때만 활성화한다.

## 6. Pairing BFF 흐름

```text
snapshot 복원
-> POST /api/wine-pairings/pairing
   Header X-Session-Id
   { wineIds, menuNames }
-> BFF가 UUID, 배열, 길이, 중복을 검증
-> POST /v1/wine-pairings/pairing
   Header X-Session-Id
   Accept text/event-stream
-> backend ReadableStream을 버퍼링 없이 전달
-> client SSE parser
-> reducer
```

BFF는 backend `Response.body`를 그대로 pipe하고 `Content-Type: text/event-stream`, `Cache-Control: no-store`, `X-Accel-Buffering: no`를 설정한다. 요청/응답 header 전체를 forward하지 않는다.

입력 타입:

```ts
type WinePairingRequest = {
  wineIds: string[];
  menuNames: string[];
};
```

`menuNames`의 공백 trim/dedupe는 snapshot 생성 시 수행하되 backend에 보내는 실제 문자열은 추천 응답 name과 동일해야 한다. BFF가 이름을 번역하거나 category로 바꾸지 않는다.

## 7. SSE 해석과 reducer 규칙

```ts
type PairingStreamEvent =
  | {
      type: "STREAM";
      data: {
        fieldName: "rank" | "name" | "comment" | "reason";
        hasNext: boolean;
        body: string;
      };
    }
  | {
      type: "JSON";
      data: PairingSlidePayload;
    };

type ChatStreamEvent = {
  type: "STREAM";
  data: { body: string };
};
```

페어링 처리:

1. field `STREAM`을 받으면 마지막 미확정 slide를 만들거나 갱신한다.
2. 같은 `fieldName`의 `body`는 append한다.
3. `hasNext`는 필드 진행 표시용으로만 쓰고 slide 완료로 해석하지 않는다.
4. `JSON`은 권위값이므로 마지막 미확정 slide를 통째로 교체한다.
5. 미확정 slide가 없어도 `JSON`만으로 committed slide를 만든다.
6. stream `done` 시 committed slide가 하나 이상이면 turn 완료, 없으면 오류다.

후속 chat 처리:

- 첫 frame이 `STREAM`이고 `data.fieldName`이 없으면 일반 chat turn이다.
- `JSON`이거나 `fieldName`이 있으면 낙관적 빈 chat turn을 pairing turn으로 교체한다.
- 일반 chat은 `data.body`를 순서대로 append한다.
- 알 수 없는 frame은 화면 데이터를 오염시키지 않도록 무시하되 진단 로그 대상으로 둔다.
- JSON schema가 잘못되면 해당 turn을 error로 종료한다.

`pairingId`는 추천 결과 묶음 ID이며 slide마다 유일하다고 가정하지 않는다. React key는 `pairingId`, `wine.id`, `rank`를 결합한다.

## 8. 최종 와인 화면 모델

```ts
type PairingStreamWine = {
  id: string;
  wineName: string;
  vintage: number | null;
  alcohol: string | null;
  price: Price[] | null;
  country: string | null;
  region: string | null;
  tannin: number | null;
  body: number | null;
  sweetness: number | null;
  acid: number | null;
  wineBottleImageUrl: string | null;
};
```

- 앞면 이미지는 `wineBottleImageUrl`, 없거나 load 실패면 기존 Wine placeholder를 쓴다.
- 이름은 `wineName`; API에 별도 한글/영문 name이 없으므로 추측하지 않는다.
- 가격은 통화 단위와 기호를 사용해 표시한다.
- 뒷면 taste profile은 `body`, `sweetness`, `tannin`, `acid` 실제 값만 0..5 scale로 표시한다.
- 현재 backend pairing mapper는 `body`를 누락하므로 실제 페어링 응답에서는 `body`가 항상 null일 수 있다. mapper 수정 전에는 바디 항목을 “정보 없음”으로 처리한다.
- 일부 값이 null이면 해당 bar를 “정보 없음”으로 표시하거나 항목을 숨긴다. null을 0으로 그리지 않는다.
- 프론트 표시명은 `acid` → “산도”로 매핑하되 DTO field를 `acidity`로 바꾸지 않는다.
- `comment`, `reason`은 top-level 최종 payload를 사용한다.

## 9. 오류·재시도·동시성

- stream 시작 전 `400`: request 손상, `404`: session/wine/menu 불일치, `409`: 단계/동시성 충돌로 safe mapping
- stream 도중 종료: 현재 turn을 error로 표시하고 부분 slide는 결과로 확정하지 않음
- 초기 pairing 실패에 같은 session/body를 자동 retry하지 않는다. 서버가 이미 pairing을 시작했을 수 있고 공개 retry endpoint가 없다.
- 복구 CTA는 “처음부터 다시 시작”으로 `/wine/list`에 이동하며 새 session을 만들게 한다.
- 일반 chat은 한 번에 하나만 허용하고 streaming 중 composer를 잠근다.
- chat 실패는 기존 완료 pairing을 유지하고 같은 메시지를 자동 재전송하지 않는다. 사용자가 새 요청으로 명시적으로 전송한다.
- unmount 시 모든 stream을 AbortController로 취소하고 이후 dispatch를 막는다.

## 10. 파일별 구현 범위

```text
web/src/app/wine/chat/page.tsx
web/src/app/entity/wine-pairing/model/wine-pairing.type.ts
web/src/app/entity/wine-pairing/api/wine-pairing.api.ts
web/src/app/entity/wine-pairing/api/wine-pairing.server.ts
web/src/app/entity/wine-pairing/lib/wine-pairing-request-storage.ts
web/src/app/feature/wine-pairing-chat/model/**
web/src/app/feature/wine-pairing-chat/api/**
web/src/app/feature/wine-pairing-chat/ui/**
web/src/app/shared/lib/sse/parse-sse-stream.ts
web/src/app/api/wine-pairings/pairing/route.ts
web/src/app/api/wine-pairings/chat/route.ts
```

same-origin BFF path는 외부 호환을 위해 유지할 수 있으나 내부 server helper는 반드시 새 backend path와 `X-Session-Id`를 사용한다.

## 11. Storybook·검증 범위

- slide: STREAM 부분 상태, committed 상태, bottle image/null, taste 값 전체/일부 null, 긴 텍스트
- carousel: 1/2/3개, 동일 pairingId의 여러 slide, 좁은 화면, reduced motion
- view: hydration, snapshot 없음, 초기 stream, 일반 chat, 재페어링, stream 중단, 각 HTTP 오류
- composer: pairing 전 disabled, chat 중 disabled, 빈/긴 message, keyboard submit
- reducer: multi-chunk append, `hasNext: false`, JSON-only, partial 후 JSON replace, zero JSON done, 일반/chat 분기
- BFF: `X-Session-Id` UUID 검증, `menuNames` shape, SSE 무버퍼 전달, 400/404/409/500 mapping, client abort

## 12. 완료 기준

- 추출 단계에서 생성한 동일 `X-Session-Id`로 pairing과 chat을 호출한다.
- `menuNames`에는 최신 추천 응답의 선택 name만 들어간다.
- STREAM 청크는 점진 렌더링되고 JSON frame이 최종 권위가 된다.
- 실제 병 이미지와 taste profile을 사용하며 null 값을 가짜 데이터로 채우지 않는다.
- 실패 시 부분 추천을 완료 결과로 노출하거나 위험한 자동 재호출을 하지 않는다.
- 일반 대화와 재페어링이 하나의 순서 있는 conversation UI에 유지된다.
