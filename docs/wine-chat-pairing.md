# `/wine/chat` 와인 페어링 스트리밍 화면

`/wine/chat`은 선택한 wine snapshot과 메뉴 카테고리로 페어링 SSE를 시작하고, 추천 카드와 후속 대화를 한 화면에 누적한다. 활성 API 계약은 `api/mysom-api.md`를 기준으로 한다.

## 1. 화면 구조

```text
WineChatPage                              [Server]
├─ PageHeader                             [Server]
└─ WinePairingChatView                    [Client]
   ├─ intro
   ├─ PairingTurnSection[]
   │  └─ WineRecommendationCarousel
   │     └─ WineRecommendationSlide[]
   │        ├─ 앞면: 순위/이름/한줄평/추천 이유
   │        └─ 뒷면: 실제 와인 상세
   ├─ ChatAnswerBubble[]
   └─ 하단 ChatComposer
```

- `PageHeader`는 `/wine/keywords`로 돌아가는 가운데 정렬 헤더다.
- page shell은 `bg-canvas bg-violet-haze`, 텍스트는 `ink-*`, 액션은 `primary` token을 사용한다.
- 캐러셀은 첫 추천에서 시작하고 다음 카드가 일부 보이는 `scroll-snap` 구조다.
- 앞면 와인 이미지 슬롯은 콘텐츠와 관계없이 가로 3:세로 7 비율로 고정한다.
- "와인 상세" 버튼은 앞면 카드 우측 상단에 고정한다.
- 한줄평은 2줄, 추천 이유는 4줄로 말줄임하며 텍스트 영역을 누르면 전체 원문 오버레이를 표시한다.
- 카드 앞/뒤 높이는 동일하다. flip은 `transform`과 `backface-visibility`를 사용하며 reduced-motion에서는 transition을 제거한다.
- 보이지 않는 카드 면은 `aria-hidden`이고 해당 면의 버튼은 tab order에서 제외된다.
- 하단 composer는 safe-area 위에 고정되며 스트림 완료 전과 채팅 응답 중에는 비활성화된다.

## 2. 표시 데이터 정책

SSE 최종 `JSON`이 제공하는 값만 렌더링한다.

```text
pairingId, rank,
wine(wineName, vintage, alcohol, price, country, region),
comment, reason
```

- 와인 이미지 URL이 없으면 `Wine` 아이콘 placeholder를 사용한다.
- 상세 뒷면은 빈티지, 도수, 가격, 국가, 지역 중 존재하는 값만 표시한다.
- 바디, 당도, 타닌, 산도, 풍미 태그는 현재 계약에 없으므로 가짜 수치나 placeholder 그래프를 표시하지 않는다.
- 일반 채팅 응답은 텍스트 답변, 재추천 응답은 새로운 PairingTurn 캐러셀로 표시한다.

## 3. 상태 관리

| 상태 | 관리 방식 | 위치 |
| --- | --- | --- |
| 페어링 요청 | sessionStorage snapshot | entity storage |
| chatId | 실행별 `useRef` | conversation hook |
| turns/stream 상태 | 로컬 `useReducer` | conversation reducer |
| 카드 flip | 슬라이드별 `useState` | slide |
| active slide | scroll 위치에서 파생 | carousel |
| composer 입력 | `useState` | composer |

- SSE 데이터는 TanStack Query나 Zustand에 복제하지 않는다.
- reducer는 순수하게 turn을 조립하고, fetch/stream/abort는 `useWinePairingConversation`에 격리한다.
- `isPairingDone`, `isComposerEnabled`, error/loading UI는 reducer 상태에서 파생한다.
- 리로드 시 snapshot은 유지하되 chatId는 새로 만들어 새 페어링을 시작한다.

## 4. SSE 흐름

```text
sessionStorage에서 WinePairingRequest 복원
-> 새 chatId 생성
-> POST /api/wine-pairing/stream/pairing
-> BFF가 백엔드 SSE body 전달
-> STREAM field chunk를 현재 slide에 누적
-> JSON payload로 slide 최종 확정
-> stream done 후 composer 활성

후속 질문
-> POST /api/wine-pairing/stream/chat
-> STREAM { body }이면 ChatTurn 답변 누적
-> STREAM { fieldName } 또는 JSON이면 PairingTurn으로 전환
```

- `STREAM`은 `rank`, `name`, `comment`, `reason` field를 점진 조립한다.
- `JSON`은 현재 추천 한 건의 권위값이며 미확정 slide를 교체한다.
- 전체 완료는 별도 frame이 아니라 `ReadableStream.done`으로 판단한다.
- 언마운트 시 `AbortController`로 진행 중 요청을 취소한다.

## 5. BFF

- `/api/wine-pairing/stream/pairing`: `X-Chat-Id`, UUID `wineIds`, `{ name }[]` 카테고리를 검증한다.
- `/api/wine-pairing/stream/chat`: `X-Chat-Id`와 공백 아닌 message를 검증한다.
- 두 route 모두 backend body를 `text/event-stream`, `no-store`, `X-Accel-Buffering: no`로 전달한다.
- 백엔드 origin, raw error body, stack은 브라우저에 노출하지 않는다.

## 6. 사용자 상호작용

- 추천 스트림 중에는 필드가 도착하는 순서대로 카드가 채워진다.
- 우측 상단 "와인 상세"과 뒷면 "돌아가기"로 카드 면을 전환한다.
- 질문 전송 직후 질문을 낙관적으로 표시한다.
- 첫 후속 SSE frame shape으로 일반 답변인지 재추천인지 확정한다.
- 채팅 답변이 진행될 때만 하단으로 자동 스크롤하고, 최초 캐러셀 스트리밍 중에는 1순위 위치를 유지한다.
- 요청 없음, loading, error 상태는 별도 상태 패널로 표시하고 오류 상태에서는 다시 시도할 수 있다.

## 7. Storybook과 검증

- Slide: streaming, committed, no image, long text, wine detail flip.
- Carousel: 1개/3개/streaming slide.
- Chat: done, streaming, empty streaming, error.
- View: pairing done/streaming/error/no request.
- `npm run build`, `npm run build-storybook`으로 타입과 번들 생성을 확인한다.
- Playwright mock SSE로 320px/390px/desktop viewport의 캐러셀 framing, 수평 overflow, composer 겹침을 확인한다.
