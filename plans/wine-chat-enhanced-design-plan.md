# `/wine/chat` 개선 디자인 구현 계획

## 1. 범위와 기준

- 대상 라우트: `web/src/app/wine/chat/page.tsx`
- 대상 시안: `designs/enhanced_design_3_1.png`, `designs/enhanced_design_3_2.png`
- 활성 API 명세: `api/mysom-api.md`의 페어링/채팅 SSE 계약
- 적용 가이드: `rsc-rendering`, `rcc-rendering`, `data-flow-layering`, `css-only-state`, `style-implementation`, `storybook-authoring`
- 목적: 최초 추천 캐러셀, 앞/뒤 상세 카드, 후속 대화, 하단 composer를 하나의 자연스러운 추천 대화 화면으로 정리한다.

## 2. API 제약과 디자인 해석

현재 활성 SSE 최종 JSON은 다음 정보만 제공한다.

```text
pairingId, rank, wine(wineName, vintage, alcohol, price, country, region), comment, reason
```

따라서 다음 원칙을 적용한다.

- 와인명, 순위, 종류에 준하는 서버 제공 문자열, 빈티지, 도수, 가격, 국가/지역, 한줄평, 추천 이유는 실제 응답만 표시한다.
- 시안의 바디·당도·타닌·산도 점수와 풍미 태그는 현재 계약에 없으므로 임의의 placeholder 수치로 표시하지 않는다.
- 테이스팅 지표/풍미는 향후 API 필드가 확정되면 상세 뒷면에 추가할 후속 범위로 남긴다.
- 현재 계약에 와인 이미지 URL이 없으므로 이미지가 없을 때는 안정적인 `Wine` 아이콘 placeholder를 사용한다. 외부 이미지를 추측해 연결하지 않는다.
- 일반 채팅 응답은 텍스트 말풍선, 재추천 응답은 새 추천 캐러셀 turn으로 표시하는 현재 의미를 유지한다.

## 3. 화면 구조

```text
WineChatPage [Server]
├─ PageHeader [Server]
│  ├─ /wine/keywords 뒤로가기
│  └─ 가운데 제목 "와인 추천"
└─ WinePairingChatView [Client]
   ├─ ConversationScrollArea
   │  ├─ IntroSection (최초 turn에서 한 번)
   │  │  ├─ "마이쏨이 추천하는 와인이에요"
   │  │  └─ 카드 뒤집기 안내
   │  ├─ PairingTurnSection[]
   │  │  ├─ 후속 재추천 질문 bubble (해당 시)
   │  │  └─ WineRecommendationCarousel
   │  │     ├─ WineRecommendationSlide[]
   │  │     │  ├─ Front: 순위/이름/기본 정보/한줄평/추천 이유
   │  │     │  └─ Back: 실제 제공 상세 정보 + 돌아가기
   │  │     └─ pagination dots
   │  ├─ ChatAnswerBubble[]
   │  └─ stream/error/empty 상태
   └─ ChatComposer (하단 고정)
```

## 4. 시각·상호작용 원칙

- 페이지 shell은 다른 와인 플로우와 동일한 `bg-canvas bg-violet-haze`를 사용한다.
- 본문/페이지 제목은 `ink-page`, 카드 제목은 `ink-card`, 강조와 밝은 버튼 라벨은 `ink-emphasis`, 설명은 `ink-secondary`, caption/placeholder는 `ink-muted`를 사용한다.
- 카드 액션, pagination 활성점, focus-visible에는 `primary`(`#6E3AF5`)를 사용하며 muted text에 추가 opacity를 적용하지 않는다.
- 헤더와 intro는 `/wine/list`, `/wine/keywords`와 같은 폭·타이포 스케일을 사용한다.
- 캐러셀은 현재 슬라이드가 주가 되면서 다음 카드가 일부 보이도록 slide basis와 gap을 설정한다. 각 슬라이드는 `scroll-snap`으로 안정적으로 정렬한다.
- 카드 높이는 앞/뒤에서 동일하게 유지한다. 앞면 이미지는 3:7 비율로 고정하고, 한줄평은 2줄·추천 이유는 4줄로 말줄임한 뒤 클릭 오버레이에서 전체 내용을 제공한다.
- 앞면은 밝은 중성 카드로 구성하고 보라색은 순위·액션·선택적 강조에만 사용한다. 강한 보라 gradient로 카드 전체를 채우지 않는다.
- 카드 뒤집기는 우측 상단의 명시적인 "와인 상세" 버튼과 뒷면 "돌아가기" 버튼으로만 수행한다. 키보드 포커스와 상태 설명을 제공한다.
- 뒤집기 애니메이션은 `transform`과 `backface-visibility`를 사용하고 `prefers-reduced-motion`에서는 즉시 전환한다.
- pagination dots는 현재 위치를 전달하되 클릭 가능한 탭처럼 표기하지 않는다. 직접 이동 기능을 제공한다면 실제 `button`과 클릭 동작을 함께 구현한다.
- 채팅 질문과 답변은 최대 폭을 달리해 화자를 구분하고, 긴 한국어/영문/URL에서도 overflow되지 않게 한다.
- composer는 safe-area를 포함한 고정 영역으로 두며, 입력창과 원형 전송 버튼의 크기가 placeholder나 disabled 상태에 따라 바뀌지 않게 한다.

## 5. 컴포넌트 책임과 변경 대상

- `wine/chat/page.tsx`: Server Component 유지, `PageHeader` 추가, 화면 shell 배경/높이 조정.
- `WinePairingChatView.tsx`: intro의 1회 노출, turn 간 간격, 스크롤 하단 여백, composer 배치를 담당한다.
- `WineRecommendationCarousel.tsx`: peek 레이아웃, snap 위치, active index, dot 의미를 정리한다.
- `WineRecommendationSlide.tsx`: 앞/뒤 정보 구조와 실제 데이터 fallback을 구현하고 가짜 테이스팅 그래프를 제거한다.
- `ChatAnswerBubble.tsx`: 시안에 맞춘 질문/답변 타이포와 폭을 적용한다.
- `ChatComposer.tsx`: 일체형 입력 프레임과 원형 아이콘 전송 버튼을 유지하며 시안 스타일을 적용한다.
- 공통 `PageHeader`, `Button`, `TextInput`, `Card`, `LoadingSpinner`를 우선 재사용한다.
- 색상과 배경은 `/wine/list`에서 등록한 `canvas`, `primary`, `ink-*`, `violet-haze` Tailwind token을 재사용한다.

## 6. RSC/RCC와 상태 관리

- `wine/chat/page.tsx`는 Server Component로 유지한다.
- SSE, reducer, scroll ref, 카드 flip, composer 입력 때문에 상호작용 영역만 Client Component로 유지한다.
- SSE turn 데이터와 스트리밍 상태는 화면 로컬 reducer가 계속 소유한다. TanStack Query나 Zustand에 복제하지 않는다.
- 카드 flip은 각 슬라이드에 국한된 `useState`로 유지한다.
- active slide index는 캐러셀 로컬 상태로 유지하고 scroll 위치에서 파생한다.
- 현재 turn, composer 활성 상태, loading/error 표시는 기존 reducer 상태에서 파생한다.
- CSS-only 전환은 단순 장식/hover/motion에 사용하고, SSE와 연동되는 상태를 CSS input으로 이중 관리하지 않는다.

## 7. 데이터와 API/BFF 흐름

```text
/wine/keywords가 저장한 WinePairingRequest 복원
-> 새 chatId 생성
-> POST /api/wine-pairing/stream/pairing
-> BFF가 POST /v1/wine-pairing/stream/pairing SSE 전달
-> STREAM 프레임으로 점진 렌더
-> JSON 프레임으로 슬라이드 최종 확정
-> stream done 후 composer 활성

후속 질문
-> POST /api/wine-pairing/stream/chat
-> 일반 chat STREAM: ChatAnswerBubble에 누적
-> pairing STREAM/JSON: 새로운 PairingTurn 캐러셀로 전환
```

- 디자인 변경에서 SSE parser, BFF validation, chatId 수명, request storage 계약은 변경하지 않는다.
- `api/mysom-api.md`의 현재 `STREAM | JSON` envelope를 기준으로 한다.
- 상세 카드에 필요한 데이터가 없을 때는 해당 행/섹션을 숨긴다. 데이터 계약을 UI에서 추정하지 않는다.

## 8. Storybook 및 검증

- `WineRecommendationSlide`: 스트리밍 중, 확정, 상세 앞/뒤, 이미지 없음, 일부 메타 없음, 긴 이름/설명.
- `WineRecommendationCarousel`: 1개/2개/3개, active dot, 좁은 폭, 다음 카드 peek.
- `WinePairingChatView`: 초기 loading, pairing streaming, 완료, 오류, 요청 없음, 일반 채팅, 재추천 turn.
- `ChatComposer`: 활성/비활성, 빈 입력, 긴 placeholder, 전송 중.
- 카드 flip의 키보드 동작, reduced-motion, 포커스 표시, screen reader label을 확인한다.
- 320px/390px 모바일과 태블릿/데스크톱에서 캐러셀 framing, 카드 높이, 하단 composer 겹침을 Playwright 스크린샷으로 검증한다.
- canvas 기반 요소는 없으므로 DOM bounding box와 horizontal overflow를 검사한다.
- `npm run build-storybook`, 프로젝트 build/type 검사, 관련 reducer/stream 테스트를 실행한다.

## 9. 후속 API 계약 항목

시안의 상세 뒷면을 완성하려면 백엔드가 아래 필드를 명시적으로 제공해야 한다.

```ts
type WineTasteProfile = {
  body: number;
  sweetness: number;
  tannin: number;
  acidity: number;
  flavorTags: string[];
};
```

- 각 점수의 최소/최대 범위와 null 정책이 함께 필요하다.
- 계약이 추가되면 entity type, SSE JSON mapper/fixture, 상세 카드, Storybook을 한 변경으로 맞춘다.

## 10. 완료 기준

- 상단 헤더/intro, peek 캐러셀, 앞뒤 상세 카드, 대화 흐름, 하단 composer가 시안의 계층으로 정리된다.
- 추천 스트리밍과 일반 채팅/재추천 분기 동작은 유지된다.
- API에 없는 테이스팅 값이나 이미지를 임의 생성하지 않는다.
- 카드 전환, 긴 콘텐츠, 빈 메타, 오류/스트리밍 상태에서 레이아웃이 흔들리거나 겹치지 않는다.
