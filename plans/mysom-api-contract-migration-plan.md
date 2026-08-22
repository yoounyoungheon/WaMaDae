# Mysom API 계약 변경 대응 구현 계획

## 1. 기준

- 변경 API 명세: `api/mysom-api.md`
- 기준 백엔드: `/Users/yoon-yeongheon/dev/mysom-api` `134e6eb`
- 대상 프론트엔드: `web/`
- 현재 와인 데이터 타입 설정: `.env`의 `WINE_DATA_TYPE="OCR"`
- 적용 가이드:
  - `web/GUIDE.md`
  - `mysom-frontend-guidance-mcp`: `data-flow-layering`, `bff-api-gateway`, `rsc-rendering`, `rcc-rendering`, `storybook-authoring`, `style-implementation`

이번 작업은 새 페이지 구현이 아니라 이미 구현된 `/wine/list`, `/wine/keywords`, `/wine/chat`의 API 계약 마이그레이션이다. 화면 레이아웃은 기존 디자인과 현재 구현을 유지하고, 데이터 계약과 SSE 해석 로직을 현재 `mysom-api` 계약에 맞춘다.

## 2. 변경 계약 요약

현재 활성 API는 아래 4개다.

```text
POST /v1/wine-pairing/wines/menu-ocr
POST /v1/wine-pairing/menu-category/recommend
POST /v1/wine-pairing/stream/pairing
POST /v1/wine-pairing/stream/chat
```

핵심 변경:

- OCR 응답의 `wines[].id`는 숫자형 DB ID가 아니라 wine snapshot UUID다.
- OCR 응답 항목은 `type: "OCR"`로 내려온다. 기존 `type: "db"` 필터링은 더 이상 맞지 않는다.
- 프론트 BFF는 사용할 OCR 응답 항목 타입을 `.env`의 `WINE_DATA_TYPE`으로 결정한다. 현재 대상 값은 `"OCR"`이다.
- 메뉴 추천 요청은 `{ wines: [...] }`가 아니라 `{ wineIds: string[] }`다.
- 페어링 요청은 `{ wines: [{ id: number }], menuCategories: string[] }`가 아니라 `{ wineIds: string[], menuCategories: [{ name: string }] }`다.
- SSE frame은 legacy `fieldName/type/status/isStreaming` envelope가 아니라 `{ type: "STREAM" | "JSON", data: ... }`다.
- 페어링 최종 JSON에는 `imageUrl`, top-level `name`, `summary`가 없다. `data.wine.wineName`, `data.wine.price`, `data.wine.country`, `data.wine.region` 등을 사용한다.
- auth/logout/upload API는 현재 활성 컨트롤러가 아니므로 프론트 호출 대상에서 제외한다.

## 3. 현재 코드와 불일치

### `/wine/list` OCR 분석

현재 BFF `web/src/app/api/wine-lists/analyze/route.ts`는 OCR 응답에서 `type === "db"`이고 숫자로 변환 가능한 `id`만 통과시킨다. 새 API에서는 `type: "OCR"`와 UUID가 정상값이므로 분석 결과가 빈 배열이 될 수 있다.

현재 `WineMenuOcrExtractItemDto`도 legacy DB 와인 상세 필드(`koreanName`, `imagePath`, `rating`, `grape`, `body` 등)를 기대한다. 새 응답은 공통 `Wine` shape(`wineName`, `vintage`, `alcohol`, `price`, `country`, `region`)이다.

또한 사용할 `type` 값이 코드에 하드코딩되어 있다. 이번 설계에서는 `WINE_DATA_TYPE`으로 `OCR` 또는 `DB`를 선택할 수 있게 하되, 현재 값은 `OCR`로 둔다.

### `/wine/keywords` 메뉴 카테고리 추천

현재 `MenuCategoryRecommendationRequest`는 `wines: [{ id, name, koreanName }]`이고, BFF는 이 shape을 검증해 그대로 백엔드로 보낸다. 새 API는 `wineIds`만 받는다.

관련 저장소, query key, query enabled 조건도 `request.wines`에 묶여 있다.

### `/wine/chat` 페어링/채팅

현재 `WinePairingRequest`는 숫자 ID 기반 `wines`와 문자열 배열 `menuCategories`를 쓴다. 새 API는 UUID 배열 `wineIds`와 객체 배열 `menuCategories`를 요구한다.

현재 SSE 타입과 reducer/hook은 `event.fieldName`, `event.data`, `event.type === "json" | "text"`를 전제로 한다. 새 API에서는 top-level `type`이 `STREAM`/`JSON`이고, 필드 청크는 `event.data.fieldName`/`event.data.body`, 일반 채팅은 `event.data.body`, 최종 페어링은 `event.data` 자체다.

## 4. 목표 데이터 흐름

### `/wine/list`

```text
Browser multipart form
-> /api/wine-lists/analyze
-> BFF validates file and magic bytes
-> POST /v1/wine-pairing/wines/menu-ocr with raw image bytes
-> { wines: [{ id, type: "OCR", wineName, vintage, alcohol, price, country, region }] }
-> BFF keeps wines where type === process.env.WINE_DATA_TYPE ("OCR" for now)
-> BFF maps matching wines to current UI WineDetailDto
-> Client maps WineDetailDto to Wine and caches known wines
-> selectedWineIds = OCR snapshot UUIDs
```

검색 API는 백엔드에 아직 없으므로 현재처럼 BFF에서 빈 배열 반환을 유지한다.

### 환경 변수 설계

```env
WINE_DATA_TYPE="OCR"
```

- 위치: Next.js 서버 런타임에서 읽히는 `web/.env` 또는 배포 환경 변수.
- 공개 여부: `NEXT_PUBLIC_`을 붙이지 않는다. 브라우저 번들에 노출하지 않고 BFF/server-only 계층에서만 읽는다.
- 허용값: `"OCR"` 또는 `"DB"`.
- 현재값: `"OCR"`.
- 기본값: 로컬 개발 편의를 위해 코드상 fallback은 `"OCR"`로 둔다.
- invalid 값: `"OCR"`/`"DB"`가 아니면 서버 시작 또는 첫 BFF 호출 시 safe error로 실패하게 한다. 조용히 `"OCR"`로 보정하지 않는다.
- 적용 범위: `POST /api/wine-lists/analyze` BFF의 OCR 응답 필터링에만 사용한다.

구현 위치는 `web/src/app/entity/wine/api/wine-data-type.server.ts` 같은 server-only helper로 둔다.

```ts
import "server-only";

export type WineDataType = "OCR" | "DB";

export function getWineDataType(): WineDataType {
  const value = process.env.WINE_DATA_TYPE ?? "OCR";
  if (value === "OCR" || value === "DB") return value;
  throw new Error("Invalid WINE_DATA_TYPE");
}
```

BFF route는 이 helper를 통해 설정을 읽고, 응답 항목을 `wine.type === getWineDataType()`으로 필터링한다. 이 값은 클라이언트 요청 body나 query string으로 받지 않는다.

### `/wine/keywords`

```text
NextRecommendationButton
-> buildMenuCategoryRecommendationRequest(selectedWines)
-> { wineIds: selectedWines.map(id).dedupe() }
-> sessionStorage
-> /wine/keywords
-> useMenuCategoryRecommendationsQuery(request)
-> Browser POST /api/wine-pairing/menu-category/recommend
-> BFF validates wineIds
-> POST /v1/wine-pairing/menu-category/recommend
-> BFF maps { menuCategories: [{ name }] } to { categories: string[] }
```

### `/wine/chat`

```text
/wine/keywords "와인 추천받기"
-> buildWinePairingRequest(storedRequest.wineIds, selectedCategories)
-> { wineIds, menuCategories: [{ name }] }
-> sessionStorage
-> /wine/chat
-> streamWinePairing(request, chatId)
-> BFF validates request and pipes backend SSE
-> Client parses STREAM/JSON frames
-> reducer builds PairingTurn/ChatTurn
```

SSE 데이터는 화면 로컬 `useReducer`에만 둔다. Zustand와 TanStack Query에 스트림 원본을 누적하지 않는다.

## 5. 파일별 구현 계획

### API 문서 및 기존 계획 문서

```text
api/mysom-api.md
plans/P1_PLAN.md
plans/wine-keywords-menu-category-recommendation-plan.md
plans/wine-chat-pairing-plan.md
docs/wine-list-select-architecture.md
docs/wine-keywords-menu-category-recommendation.md
docs/wine-chat-pairing.md
```

- `api/mysom-api.md`는 이미 새 계약 기준으로 갱신되어 있으므로 구현 중 source of truth로 사용한다.
- 구현 후 기존 계획/개발 문서의 legacy `wines`, 숫자 ID, legacy SSE envelope 설명을 새 계약으로 갱신한다.
- 오래된 하위 API 문서(`api/mysom-wine-pairing.md`, `api/mysom-ocr.md`)를 직접 고칠지는 구현 후 별도 판단한다. 이번 코드 변경의 기준 문서는 `api/mysom-api.md`로 고정한다.

### Wine entity / OCR BFF

```text
web/src/app/entity/wine/model/wine.type.ts
web/src/app/api/wine-lists/analyze/route.ts
web/src/app/entity/wine/api/wine-data-type.server.ts
web/src/app/entity/wine/api/wine.mapper.ts
```

- `WineMenuOcrExtractItemDto`를 새 backend `Wine` shape에 맞춘다.
- OCR enum은 `"OCR" | "DB"` 대문자로 정의한다.
- BFF의 `isDbWineMenuOcrExtractItem`와 숫자 ID 검증을 제거하고, `WINE_DATA_TYPE` 기반 type 필터와 UUID 문자열 기반 검증으로 바꾼다.
- `wine-data-type.server.ts`를 추가해 `process.env.WINE_DATA_TYPE ?? "OCR"`을 `"OCR" | "DB"`로 검증한다.
- 현재 `.env`/배포 환경에는 `WINE_DATA_TYPE="OCR"`을 사용한다.
- OCR 응답을 기존 UI `WineDetailDto`로 정규화한다.
  - `id`: snapshot UUID
  - `display_name`, `title`: `wineName`
  - `image_url`: 새 API에 이미지 필드가 없으므로 `/ExampleImage.png`
  - `rating`: 새 API에 평점 필드가 없으므로 `0`
  - `price_label`: `price[0]`가 있으면 통화별 표시, 없으면 `가격 정보 없음`
  - `recommendation_text`: `country`, `region`, `vintage`, `alcohol`, `type` 등 사용 가능한 값 조합
- 기존 검색 mock DTO는 건드리지 않는다.

### Menu category recommendation

```text
web/src/app/entity/menu-category-recommendation/model/menu-category-recommendation.type.ts
web/src/app/entity/menu-category-recommendation/lib/build-menu-category-recommendation-request.ts
web/src/app/entity/menu-category-recommendation/lib/recommendation-request-storage.ts
web/src/app/entity/menu-category-recommendation/api/menu-category-recommendation.api.ts
web/src/app/entity/menu-category-recommendation/api/menu-category-recommendation.server.ts
web/src/app/entity/menu-category-recommendation/api/menu-category-recommendation.mapper.ts
web/src/app/api/wine-pairing/menu-category/recommend/route.ts
web/src/app/feature/menu-category-recommendation-result/api/menu-category-recommendation-query-keys.ts
web/src/app/feature/menu-category-recommendation-result/api/use-menu-category-recommendations-query.ts
web/src/app/feature/menu-category-recommendation-result/ui/MenuCategoryRecommendationPage.tsx
web/src/app/feature/wine-list-select/ui/NextRecommendationButton.tsx
```

- request type을 `{ wineIds: string[] }`로 변경한다.
- `buildMenuCategoryRecommendationRequest`는 선택된 `Wine[]`에서 nonblank UUID-ish id만 dedupe해 `wineIds`를 만든다. 이름 필드는 더 이상 보내지 않는다.
- sessionStorage parser는 `wineIds` 배열만 검증한다. legacy 저장값은 invalid로 보고 빈 상태로 보낸다.
- query key는 `request.wineIds` 기반으로 변경한다.
- query enabled와 버튼 disabled 조건도 `wineIds.length > 0`으로 변경한다.
- BFF route는 `wineIds` 배열을 검증하고 그대로 server helper로 전달한다.
- backend `404 Wine not found`는 사용자가 이해할 safe message로 매핑한다.

### Wine pairing stream

```text
web/src/app/entity/wine-pairing/model/wine-pairing.type.ts
web/src/app/entity/wine-pairing/lib/build-wine-pairing-request.ts
web/src/app/entity/wine-pairing/lib/wine-pairing-request-storage.ts
web/src/app/entity/wine-pairing/api/wine-pairing.api.ts
web/src/app/entity/wine-pairing/api/wine-pairing.server.ts
web/src/app/api/wine-pairing/stream/pairing/route.ts
web/src/app/api/wine-pairing/stream/chat/route.ts
```

- `WinePairingRequest`를 `{ wineIds: string[], menuCategories: Array<{ name: string }> }`로 바꾼다.
- `PairingStreamWine`을 새 `Wine` shape에 맞춘다.
- `PairingSlidePayload`를 `{ pairingId, rank, wine, comment, reason }`로 바꾼다.
- 새 SSE 타입을 추가한다.

```ts
type PairingStreamEvent =
  | { type: "STREAM"; data: { fieldName: "rank" | "name" | "comment" | "reason"; hasNext: boolean; body: string } }
  | { type: "JSON"; data: PairingSlidePayload };

type PairingChatStreamEvent =
  | PairingStreamEvent
  | { type: "STREAM"; data: { body: string } };
```

- `buildWinePairingRequest`는 `wineIds`를 그대로 dedupe하고, 선택 카테고리를 `{ name }` 객체 배열로 변환한다.
- storage parser도 새 request shape만 허용한다.
- pairing BFF route는 `wineIds` UUID 문자열 배열과 `menuCategories[].name`을 검증한다.
- chat BFF route는 요청 shape 변경이 없으므로 유지하되 backend `404`를 safe 404 또는 사용자 메시지로 분기할지 확인한다.
- BFF는 backend SSE body를 계속 버퍼링 없이 pipe한다.

### Conversation reducer / hook / UI

```text
web/src/app/feature/wine-pairing-chat/model/conversation.types.ts
web/src/app/feature/wine-pairing-chat/model/conversation.reducer.ts
web/src/app/feature/wine-pairing-chat/api/use-wine-pairing-conversation.ts
web/src/app/feature/wine-pairing-chat/ui/WineRecommendationSlide.tsx
web/src/app/feature/wine-pairing-chat/ui/*.stories.tsx
```

- `PairingSlideView`에서 `imageUrl`은 optional/fallback으로 다룬다. 새 최종 JSON에는 top-level `imageUrl`이 없으므로 슬라이드 시작은 첫 `rank` field 또는 `JSON` frame에서 보장한다.
- `PAIRING_SLIDE_START` 액션은 제거하거나 `PAIRING_SLIDE_FIELD`가 슬라이드가 없으면 생성하도록 변경한다.
- field 청크는 `body`를 누적해야 한다. 새 API는 `hasNext` 단위 chunk이므로 기존처럼 `field = data` 대입하면 긴 값의 앞 청크가 유실될 수 있다.
- 최종 `JSON` frame은 마지막 슬라이드를 `PairingSlidePayload`로 commit한다.
- 일반 채팅 여부는 `event.type === "STREAM" && !("fieldName" in event.data)`로 판단한다.
- 페어링/재페어링 여부는 `event.type === "JSON"` 또는 `event.type === "STREAM" && "fieldName" in event.data`로 판단한다.
- `WineRecommendationSlide` 뒷면은 새 wine shape에 맞게 표시한다.
  - 이름: `wine.wineName`
  - subtitle: `country`, `region`
  - 메타: `vintage`, `alcohol`, `price`
  - 제거: `koreanName`, `category`, `grape`, `rating`, `body`, `sweetness`, `tannin`, `acidity`
- Storybook fixtures와 SSE mock frames를 새 envelope로 변경한다.

## 6. 구현 순서

1. `WINE_DATA_TYPE` server-only helper를 추가하고 현재 기본/환경값을 `OCR`로 둔다.
2. `wine.type.ts`와 OCR BFF를 새 OCR 응답 shape으로 바꿔 `/wine/list` 분석 결과가 설정된 data type의 UUID wine snapshot을 선택하도록 한다.
3. 메뉴 카테고리 추천 request/storage/query/BFF를 `wineIds` 기반으로 바꾼다.
4. 페어링 request/storage/BFF를 `wineIds` + `{ name }` menu category 기반으로 바꾼다.
5. SSE 타입, hook, reducer를 `STREAM`/`JSON` envelope로 바꾸고 field chunk 누적 로직을 적용한다.
6. 와인 추천 슬라이드 UI와 Storybook fixture를 새 `Wine` shape에 맞춘다.
7. 기존 계획/개발 문서의 legacy 계약 설명을 새 계약으로 정리한다.
8. 타입체크/빌드/Storybook 빌드로 검증한다.

### 후속 UI 반영 사항

- `/wine/list` OCR 분석 결과는 `price_label`을 API/BFF 모델에 유지하지만 선택 카드 UI에서는 가격을 표시하지 않는다. 현재 가격 미표시는 UI 정책이며 백엔드 계약 변경이 아니다.
- `/wine/chat` 와인 상세 뒷면은 새 `Wine` shape에 없는 그래프용 메타데이터를 실제 데이터처럼 확정 표시하지 않는다.
- 그래프 영역은 `WineProfilePreview` placeholder로 유지한다. 임의 지표(`바디`, `당도`, `타닌`, `산도`)를 렌더하되, 그래프 영역 내부에만 `bg-black/70` 오버레이와 "준비중인 기능이에요." 문구를 표시한다.
- 그래프 wrapper의 바깥 y축 여백은 카드 x축 여백과 같은 `5` 단위로 맞춘다. 막대 track은 고정 픽셀 높이가 아니라 wrapper 높이를 따르는 `flex-1` 구조로 유지하고, 데이터 막대 높이는 `value / max`를 0~100%로 clamp한 상대 비율로만 계산한다.

## 7. 검증 계획

우선순위:

```bash
cd web
npx tsc --noEmit
npm run build
npm run build-storybook
```

가능하면 추가 확인:

- `WINE_DATA_TYPE="OCR"`일 때 `/api/wine-lists/analyze`가 `type: "OCR"` 항목을 통과시키는지 확인한다.
- invalid `WINE_DATA_TYPE`이 조용히 fallback되지 않고 safe error로 드러나는지 확인한다.
- `/api/wine-lists/analyze`가 새 OCR 응답을 받았을 때 `wines`를 비우지 않는지 BFF 단위로 수동 확인한다.
- `/api/wine-pairing/menu-category/recommend`가 `{ wineIds }`만 받고 legacy `{ wines }`는 거절하는지 확인한다.
- `/api/wine-pairing/stream/pairing`이 `{ wineIds, menuCategories: [{ name }] }`만 받고 backend SSE를 그대로 pipe하는지 확인한다.
- Storybook 또는 로컬 화면에서 `/wine/list -> /wine/keywords -> /wine/chat` 흐름의 버튼 활성화와 스트림 렌더링을 확인한다.

## 8. 위험과 결정

- 새 OCR 응답에는 이미지/평점/품종/바디감 정보가 없다. 기존 카드 UI는 fallback 이미지와 축소된 메타 정보로 유지한다.
- `wineIds`는 UUID다. 숫자 ID로 변환하는 모든 로직은 제거한다.
- `WINE_DATA_TYPE`은 server-only 설정이다. 클라이언트에서 이 값을 직접 읽거나 사용자가 요청마다 바꾸게 하지 않는다.
- 현재는 `WINE_DATA_TYPE="OCR"`만 실제 사용 대상으로 본다. `DB`는 백엔드가 같은 `Wine` shape의 `type: "DB"` 항목을 내려줄 때를 위한 전환 지점이다.
- 백엔드 validation 오류 body는 현재 Spring 기본 body일 수 있으므로 BFF는 내부 오류 body를 그대로 노출하지 않고 safe message를 반환한다.
- 기존 sessionStorage에 저장된 legacy shape은 마이그레이션하지 않고 invalid로 처리한다. 저장된 요청은 한 세션용 draft라 호환 레이어를 유지할 가치가 낮다.
- API 계약 기준은 `api/mysom-api.md` 하나로 둔다. 하위 legacy API 문서는 후속 정리 대상이다.
