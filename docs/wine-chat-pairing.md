# `/wine/chat` 와인 페어링 스트리밍 대화 흐름

`/wine/chat` 화면에서 선택 와인·메뉴 카테고리로 페어링 추천을 SSE로 점진 렌더하고,
후속 질문을 스트리밍 말풍선으로 누적하는 흐름을 정리한 문서다. 기준 컴포넌트는
`feature/wine-pairing-chat/ui/WinePairingChatView.tsx`이다.

이 문서의 코드 경로는 별도 표기가 없으면 `web/src/app/`을 기준으로 한다.
설계 배경은 `plans/wine-chat-pairing-plan.md`, API 계약은 `api/mysom-wine-pairing.md`
(`POST /v1/wine-pairing/stream/pairing`, `POST /v1/wine-pairing/stream/chat`)를 참고한다.

## 1. 한눈에 보기

```text
wine/chat/page.tsx                 [Server Component]  헤더 없음
└─ WinePairingChatView             [Client]  "use client"
   ├─ 대화 스크롤 영역
   │  ├─ "마이쏨이 추천하는 와인이에요!" 타이틀
   │  ├─ PairingTurnSection
   │  │  └─ WineRecommendationCarousel   # 가로 snap + dots
   │  │     └─ WineRecommendationSlide[]
   │  └─ ChatAnswerBubble[]              # 질문(우측)+답변(좌측) 말풍선
   └─ 하단 sticky ChatComposer           # 페어링 완료 후 활성화
```

- 디자인(p6) 기준으로 상단 헤더, 하단 푸터, "채팅으로 맞춤 질문을 해보세요!" 헤딩,
  프리셋 질문 버튼은 없다.

## 2. 진입 흐름

`/wine/keywords` 하단 "와인 추천받기" 버튼(`MenuCategoryRecommendationPage`):

```text
클릭
-> buildWinePairingRequest(storedRequest.wines, selectedCategories)
   - 정수 문자열 id만 number로 통과, 카테고리는 trim + 중복 제거
-> saveWinePairingRequest(...)   [sessionStorage 스냅샷]
-> router.push("/wine/chat")
```

- 비활성화 조건: 정수 id 와인 0개 또는 선택 카테고리 0개.
- 스냅샷 덕분에 `/wine/chat` 리로드 시에도 새 chatId로 재-페어링해 결과를 복원한다.

## 3. SSE 렌더링 규칙 (백엔드 협의 기준)

각 SSE 프레임을 `fieldName`과 `type`으로 해석한다.

| 프레임 | 동작 |
| --- | --- |
| `imageUrl` / text / start | 새 슬라이드 인스턴스 시작(스켈레톤 push) |
| `rank`·`name`·`comment`·`reason` / text / painting | 해당 필드 점진 페인팅 |
| `pairing` / json / next | 슬라이드 전체를 최종 payload로 replace(권위값) |
| `chat` / text / painting | 마지막 답변 말풍선에 청크 이어붙임 |

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
  - 스트림 시작 전 백엔드 400 → safe 400, 그 외 → safe 502(내부 정보 비노출)
- **Feature** `feature/wine-pairing-chat/`
  - `model/conversation.types.ts` + `conversation.reducer.ts`: Turn 유니온과 순수 reducer
  - `api/use-wine-pairing-conversation.ts`: 스냅샷 hydration, 스트림 실행, sendChat/retryPairing
  - `ui/*`: View / Carousel / Slide / AnswerBubble / Composer

## 6. UI 동작

- **캐러셀**: CSS scroll snap 가로 스크롤, dots는 스크롤 위치에서 파생(`useState`).
  스트리밍으로 새 슬라이드가 생기면 자동으로 해당 슬라이드로 스크롤한다.
- **슬라이드**: 보라 그라디언트 카드, 좌상단 와인 이미지 원형(이미지 없으면 Wine 아이콘),
  `{rank}순위` pill, 와인명, "와마대 한줄평"(`comment`), "추천 이유"(`reason`).
- **말풍선**: 질문 우측(primary), 답변 좌측(white). 스트리밍 중 타이핑 dot 3개,
  오류 시 말풍선 안에 오류 문구(`role="alert"`).
- **입력창**: 페어링 완료 전 placeholder `와인 추천이 끝나면 질문할 수 있어요` + 비활성.
  채팅 스트리밍 중에도 비활성(중복 전송 방지). 빈 문자열 전송 방지.
- **자동 스크롤**: 채팅 턴이 진행될 때만 하단으로 스크롤(캐러셀 페인팅 중에는 유지).
- **상태 패널**: 스냅샷 없음(→ `/wine/list` 이동 버튼), 페어링 준비 중, 페어링 오류(다시 시도).

## 7. 검증 결과

`tsc`/`build`/`build-storybook` 통과. 실제 백엔드(localhost:8080) 대상 라이브 확인:

- BFF 검증: chatId 누락/빈 wines → safe 400
- 페어링 스트림: 6프레임(imageUrl→rank→name→comment→reason→pairing json)이 BFF를 통해
  그대로 파이프됨(실제 추천 응답 확인)
- 같은 chatId 후속 채팅: 답변 텍스트 청크 스트리밍 확인
- 같은 chatId 재-페어링: safe 400(새 chatId 정책의 근거)

## 8. Storybook

- `WineRecommendationSlide`: Default, LongText, NoImage, StreamingPainting
- `WineRecommendationCarousel`: SingleSlide, ThreeSlides, StreamingPainting
- `ChatAnswerBubble`: Done, Streaming, StreamingEmpty, Error
- `ChatComposer`: Enabled, Disabled
- `WinePairingChatView`: PairingDone(채팅 인터랙션 가능), PairingStreaming, PairingError, NoRequest
  - View story는 sessionStorage seed + `fetch`를 SSE `ReadableStream` 스텁으로 재현하고
    cleanup에서 복원한다.

## 9. 구현 시 결정 사항

- 채팅 응답은 텍스트만 오므로(백엔드 확인) 캐러셀은 최초 페어링 1개, 이후는 말풍선 누적.
- `imageUrl`이 빈 문자열인 프레임이 실제로 존재(확인됨) → Wine 아이콘 placeholder로 처리.
- 알 수 없는 `fieldName` 프레임은 무시(forward-compat), JSON이 아닌 프레임은 파서가 건너뜀.
- 페어링 스트림 자체가 오류로 끊기면 turn을 error로 표시하고 새 chatId로 재시도할 수 있다.
