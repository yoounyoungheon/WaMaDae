# `/wine/chat` 와인 페어링 스트리밍 대화 흐름

`/wine/chat` 화면에서 선택 와인·메뉴 카테고리로 페어링 추천을 SSE로 점진 렌더하고,
후속 질문을 스트리밍 말풍선으로 누적하는 흐름을 정리한 문서다. 기준 컴포넌트는
`feature/wine-pairing-chat/ui/WinePairingChatView.tsx`이다.

이 문서의 코드 경로는 별도 표기가 없으면 `web/src/app/`을 기준으로 한다.
설계 배경은 `plans/wine-chat-pairing-plan.md`, 최신 API 계약은 `api/mysom-api.md`
(`POST /v1/wine-pairing/stream/pairing`, `POST /v1/wine-pairing/stream/chat`)를 참고한다.

## 1. 한눈에 보기

```text
wine/chat/page.tsx                 [Server Component]  헤더 없음
└─ WinePairingChatView             [Client]  "use client"
   ├─ 대화 스크롤 영역
   │  ├─ PairingTurnSection (source="initial")
   │  │  ├─ "마이쏨이 추천하는 와인이에요!" 타이틀
   │  │  └─ WineRecommendationCarousel   # 가로 snap + dots
   │  │     └─ WineRecommendationSlide[] # 완료 후 "와인 상세" 버튼 → 3D 플립
   │  ├─ ChatAnswerBubble[]              # 질문(우측)+답변(좌측) 말풍선
   │  └─ PairingTurnSection (source="recommendation")  # 재추천 시 추가
   │     ├─ 질문 버블 (우측, primary)
   │     └─ WineRecommendationCarousel
   └─ 하단 sticky ChatComposer           # 페어링 완료 후 활성화
```

- 디자인(p6) 기준으로 상단 헤더, 하단 푸터, "채팅으로 맞춤 질문을 해보세요!" 헤딩,
  프리셋 질문 버튼은 없다.

## 2. 진입 흐름

`/wine/keywords` 하단 "와인 추천받기" 버튼(`MenuCategoryRecommendationPage`):

```text
클릭
-> buildWinePairingRequest(storedRequest.wineIds, selectedCategories)
   - UUID wineIds만 통과, 카테고리는 trim + 중복 제거 후 { name } 객체로 변환
-> saveWinePairingRequest(...)   [sessionStorage 스냅샷]
-> router.push("/wine/chat")
```

- 비활성화 조건: UUID `wineIds` 0개 또는 선택 카테고리 0개.
- 스냅샷 덕분에 `/wine/chat` 리로드 시에도 새 chatId로 재-페어링해 결과를 복원한다.

## 3. SSE 렌더링 규칙 (백엔드 협의 기준)

각 SSE `data:` JSON payload의 top-level `type`을 기준으로 해석한다.

| 프레임 | 동작 |
| --- | --- |
| `{ type: "STREAM", data: { fieldName, body } }` | 페어링 슬라이드의 `rank`/`name`/`comment`/`reason` 필드에 청크를 이어붙임. 슬라이드가 없거나 마지막 슬라이드가 commit된 상태면 새 슬라이드를 만든다. |
| `{ type: "JSON", data: { pairingId, rank, wine, comment, reason } }` | 마지막 미확정 슬라이드를 최종 payload로 replace한다. STREAM 프레임 없이 JSON이 먼저 와도 슬라이드를 보장한다. |
| `{ type: "STREAM", data: { body } }` | 일반 채팅 답변으로 보고 마지막 답변 말풍선에 청크를 이어붙임. |

전체 완료는 stream `done`으로 판단한다(별도 완료 프레임 없음).

## 4. 상태 관리

| 상태 | 관리 방식 | 위치 |
| --- | --- | --- |
| 페어링 요청 스냅샷 | sessionStorage | `entity/wine-pairing/lib/wine-pairing-request-storage.ts` |
| chatId | `useRef`(실행마다 새로 생성) | 컨트롤러 훅 |
| 대화(turns) + 스트리밍 상태 | 뷰 로컬 `useReducer`(순수) | `model/conversation.reducer.ts` |
| 입력 중 메시지 | `useState` | `ChatComposer` |
| `isPairingDone`/`isComposerEnabled` | reducer 상태에서 파생 | 컨트롤러 훅 |

- SSE 데이터는 Zustand/TanStack Query에 저장하지 않는다(가이드 준수). 이 화면은 둘 다 미사용.
- reducer는 순수 함수이고 스트림 읽기(부수효과)는 `api/use-wine-pairing-conversation.ts`에 격리.
- 흐름: 스트림 읽기(이펙트) → `dispatch` → 순수 reducer가 다음 UI 상태 계산(단방향).

### chatId 수명

- 백엔드는 한 chatId로 pairing 1회만 허용(재요청 400), chat은 pairing 선행 chatId 필요.
- chatId는 저장하지 않고 페어링 실행마다 `crypto.randomUUID()`로 생성한다.
  리로드 시 새 chatId로 재-페어링(신규 대화)하며 과거 채팅 이력은 복원하지 않는다.
- StrictMode/언마운트: effect cleanup에서 `AbortController.abort()` + 상태 RESET 후
  재마운트 시 새 실행으로 복구한다(프로덕션에서는 마운트당 1회 POST).
- 페어링 실패 시 "다시 시도"는 새 chatId로 처음부터 재시작한다(`retryPairing`).

## 5. 계층별 책임

- **shared** `shared/lib/sse/parse-sse-stream.ts`
  - `text/event-stream` body를 `data:` 프레임 단위 JSON으로 파싱하는 async generator.
- **Entity** `entity/wine-pairing/`
  - `model/wine-pairing.type.ts`: 요청 body / SSE 프레임 DTO 타입
  - `lib/build-wine-pairing-request.ts`: 선택 결과 → 요청 순수 변환
  - `lib/wine-pairing-request-storage.ts`: sessionStorage 스냅샷(검증 포함)
  - `api/wine-pairing.api.ts`: BFF 스트림 fetch + 파싱 generator(`streamWinePairing`/`streamWinePairingChat`)
  - `api/wine-pairing.server.ts`: server-only 백엔드 스트림 오픈(`X-Chat-Id` 재구성)
- **BFF** `api/wine-pairing/stream/{pairing,chat}/route.ts`
  - `force-dynamic` + nodejs runtime, `maxDuration 300`
  - body/`X-Chat-Id` 검증 후 백엔드 SSE body를 그대로 파이프
  - 헤더: `text/event-stream`, `no-store`, `X-Accel-Buffering: no`
  - 스트림 시작 전 백엔드 400 → safe 400, 404 → safe 404, 그 외 → safe 502(내부 정보 비노출)
- **Feature** `feature/wine-pairing-chat/`
  - `model/conversation.types.ts` + `conversation.reducer.ts`: Turn 유니온과 순수 reducer
  - `api/use-wine-pairing-conversation.ts`: 스냅샷 hydration, 스트림 실행, sendChat/retryPairing
  - `ui/*`: View / Carousel / Slide / AnswerBubble / Composer

## 6. UI 동작

- **캐러셀**: CSS scroll snap 가로 스크롤, dots는 스크롤 위치에서 파생(`useState`).
  스트리밍으로 새 슬라이드가 생기면 자동으로 해당 슬라이드로 스크롤한다.
- **슬라이드**: 보라 그라디언트 카드, 좌상단 와인 이미지 원형(이미지 없으면 Wine 아이콘),
  `{rank}순위` pill, 와인명, "와마대 한줄평"(`comment`), "추천 이유"(`reason`).
- **와인 상세 플립**: `slide.isCommitted && slide.wine !== null`이면 카드 우상단에 "와인 상세" 텍스트 버튼 노출. 클릭 시 CSS 3D flip(0.5s, `rotateY(180deg)`)으로 뒷면 전환. 뒷면은 흰색 카드로 `PairingStreamWine`의 `wineName`, `country`, `region`, `price`, `vintage`, `alcohol`만 표시한다. null 필드는 생략한다. "돌아가기" 버튼으로 앞면 복귀. 플립 상태(`isFlipped`)는 슬라이드 컴포넌트 내부 `useState`로 슬라이드별 독립 관리.
- **와인 그래프 영역**: 새 API에는 품종/바디/당도/타닌/산도 같은 그래프용 메타데이터가 없다. 따라서 `WineProfilePreview`는 UI placeholder로 임의 지표(`바디`, `당도`, `타닌`, `산도`)를 표시하고, 그래프 영역 내부에만 `bg-black/70` 오버레이와 "준비중인 기능이에요." 문구를 얹는다. 카드 전체나 와인 기본 메타 영역에는 오버레이를 걸지 않는다. 그래프 wrapper는 카드의 x축 바깥 여백과 같은 `5` 단위 y축 여백(`mt-5`, 카드 `pb-5`)을 사용한다.
- **막대 그래프 높이 정책**: 그래프 wrapper는 `flex-[1_1_92px] min-h-0`으로 남은 카드 높이에 따라 동적으로 커지거나 줄어든다. 막대 track도 고정 픽셀 높이를 쓰지 않고 `flex-1 min-h-0 overflow-hidden`으로 부모 높이를 따른다. 데이터 막대는 `value / max`를 0~100%로 clamp한 비율만 사용하므로, 같은 값이라도 서로 다른 높이의 그래프 wrapper 안에서는 실제 픽셀 높이가 상대적으로 달라진다. 막대는 항상 track 내부에 갇혀 전체 UI 높이를 벗어나면 안 된다.
- **sendChat 낙관적 UI**: 전송 즉시 `CHAT_START`를 dispatch해 질문 버블을 노출한다. 첫 SSE frame으로 응답 종류를 확정한다. 재추천 응답이면 `RECOMMENDATION_START`가 빈 ChatTurn을 제거하고 PairingTurn으로 대체한다.
- **말풍선**: 질문 우측(primary), 답변 좌측(white). 스트리밍 중 타이핑 dot 3개,
  오류 시 말풍선 안에 오류 문구(`role="alert"`).
- **입력창**: 페어링 완료 전 placeholder `와인 추천이 끝나면 질문할 수 있어요` + 비활성.
  채팅 스트리밍 중에도 비활성(중복 전송 방지). 빈 문자열 전송 방지.
- **자동 스크롤**: 채팅 턴이 진행될 때만 하단으로 스크롤(캐러셀 페인팅 중에는 유지).
- **상태 패널**: 스냅샷 없음(→ `/wine/list` 이동 버튼), 페어링 준비 중, 페어링 오류(다시 시도).

## 7. 검증 결과

최근 확인:

- `npx tsc --noEmit` 통과
- `npm run build` 통과
- `npm run build-storybook` 통과
- 로컬 dev 서버(`/wine/chat`) HMR 컴파일 확인

## 8. Storybook

- `WineRecommendationSlide`: Default, LongText, NoImage, StreamingPainting, WithWineDetail(플립 버튼 노출·클릭으로 뒷면 확인)
- `WineRecommendationCarousel`: SingleSlide, ThreeSlides, StreamingPainting
- `ChatAnswerBubble`: Done, Streaming, StreamingEmpty, Error
- `ChatComposer`: Enabled, Disabled
- `WinePairingChatView`: PairingDone(채팅 인터랙션 가능), PairingStreaming, PairingError, NoRequest
  - View story는 sessionStorage seed + `fetch`를 SSE `ReadableStream` 스텁으로 재현하고
    cleanup에서 복원한다.

## 9. 구현 시 결정 사항

- 채팅 스트림은 일반 답변(`STREAM` + `body`)과 pairing frame(`STREAM` + `fieldName` 또는 `JSON`) 두 갈래다. 첫 frame shape으로 응답 종류를 확정한다.
- 새 최종 `JSON`에는 top-level `imageUrl`이 없다. Wine 아이콘 placeholder로 처리한다.
- 알 수 없는 `fieldName` 프레임은 무시(forward-compat), JSON이 아닌 프레임은 파서가 건너뜀.
- 페어링 스트림 자체가 오류로 끊기면 turn을 error로 표시하고 새 chatId로 재시도할 수 있다.
