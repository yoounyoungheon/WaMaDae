# `/wine/ai` 메뉴 카테고리 추천 생성 계획

> ⚠️ 업데이트(변경됨): 이 문서가 기준으로 삼은 비동기 API
> `POST /v1/menu-category-recommendations`(작업 생성) + id polling은 레거시가 되었다.
> 실제 구현은 동기 API `POST /v1/wine-pairing/menu-category/recommend`
> (`api/mysom-wine-pairing.md`)를 사용하며, 추천 호출은 `/wine/keywords` 결과 화면이
> 담당한다. `/wine/ai`의 `다음` 버튼은 추천을 생성하지 않고 결과 화면으로 이동만 한다.
> 아래 5~13절(비동기 생성/Idempotency/Location 파싱)은 더 이상 유효하지 않다.
> 구현 기준은 `docs/wine-ai-menu-category-recommendation.md`를 참고한다.

## 1. 기준

- 대상 라우트: `web/src/app/wine/ai/page.tsx`
- 기존 계획: `plans/P1_PLAN.md`
- 관련 디자인: `designs/p1_1.png`, `designs/p1_2.png`
- API 명세: `api/mysom-menu-category-recommendations.md`
- 적용 가이드:
  - `data-flow-layering`
  - `bff-api-gateway`
  - `rsc-rendering`
  - `rcc-rendering`
  - `storybook-authoring`
  - `style-implementation`

이 문서는 `/wine/ai` 페이지에서 선택된 와인 목록으로 메뉴 카테고리 추천 작업을
생성하고, 생성된 작업 ID로 `/wine/keywords?id={id}`에 이동하는 변경만 다룬다.

## 2. 요구사항 해석

사용자가 `다음` 버튼을 누르면 브라우저에서 백엔드를 직접 호출하지 않고 BFF를 통해
추천 작업 생성을 요청한다.

```text
WineListSelectPage
-> POST /api/menu-category-recommendations
-> BFF
-> POST /v1/menu-category-recommendations
-> Location: /v1/menu-category-recommendations/{id}
-> router.push("/wine/keywords?id={id}")
```

`POST /v1/menu-category-recommendations`는 응답 body가 없고 `Location` 헤더로 조회
URL을 반환한다. 이 계획에서는 "요청이 완료되면"을 추천 작업 자체의 `SUCCEEDED`가
아니라, POST 요청이 정상 응답하고 유효한 추천 작업 ID를 확보한 시점으로 해석한다.
작업의 `PENDING`/`RUNNING`/`SUCCEEDED`/`FAILED` 처리는 `/wine/keywords` 페이지가
`GET /v1/menu-category-recommendations/{id}` polling으로 담당한다.

## 3. 페이지 구조

```text
WineAiPage [Server]
├─ PageHeader [Server]
└─ WineListSelectPage [Client]
   ├─ WineMenuPhotoSection
   ├─ WineSearchSection
   ├─ SelectedWineSection
   └─ NextRecommendationButton
```

`page.tsx`는 Server Component로 유지한다. 사용자 이벤트, mutation, router 이동은
이미 Client Boundary인 `WineListSelectPage`와 하위 버튼 영역에서 처리한다.

기존 `Link href="/wine/keywords"`는 제거하고 `Button`의 `onClick`에서 mutation을
실행한 뒤 성공 시 `useRouter().push()`로 이동한다.

## 4. 상태 분류

| 상태 | 출처 | 관리 방식 |
| --- | --- | --- |
| 선택된 와인 ID와 순서 | 사용자 draft | 기존 `WineListSelectionProvider`의 Zustand |
| 선택 와인 카드 데이터 | 검색/OCR 응답으로 받은 서버 데이터 | 기존 `known wines` TanStack Query cache |
| 추천 생성 요청 상태 | POST mutation 생명주기 | TanStack Query `useMutation` |
| 생성된 추천 작업 ID | POST 응답 `Location`에서 파생 | mutation 성공 콜백에서 즉시 router 이동 |
| 생성 오류 | BFF safe error | mutation `error` |

서버 응답 배열이나 추천 작업 ID를 Zustand에 저장하지 않는다. `/wine/keywords`에서
필요한 공유·복원 상태는 URL `searchParams.id`를 source of truth로 둔다.

## 5. API 계약

백엔드 명세:

```http
POST /v1/menu-category-recommendations
Idempotency-Key: {uuid}
Content-Type: application/json
```

```ts
type CreateMenuCategoryRecommendationRequest = {
  wines: Array<{
    id: number | null;
    name: string;
  }>;
};
```

응답:

```text
200 OK 또는 202 Accepted
Location: /v1/menu-category-recommendations/{id}
Body 없음
```

프론트 입력 변환:

- `selectedWines`를 `wines` 배열로 변환한다.
- `Wine.id`는 현재 앱 모델에서 `string`이므로 숫자로 변환 가능한 값만 `number`로 보내고,
  숫자로 변환할 수 없으면 `null`로 보낸다.
- `name`은 `Wine.name`을 사용한다.
- 선택 와인이 1개 미만이면 요청하지 않는다.

## 6. BFF 설계

신규 Route Handler:

```text
web/src/app/api/menu-category-recommendations/route.ts
```

브라우저 요청:

```http
POST /api/menu-category-recommendations
Content-Type: application/json
```

브라우저 응답:

```ts
type CreateMenuCategoryRecommendationResponse = {
  id: string;
  location: string;
};
```

Route Handler 책임:

- JSON body와 `wines` 배열을 검증한다.
- 최소 1개 이상의 와인이 있어야 한다.
- `wines[].id`는 `number | null`, `wines[].name`은 비어 있지 않은 문자열로 제한한다.
- 서버에서 `Idempotency-Key` UUID를 보장해 백엔드에 전달한다.
- 백엔드 `Location` 헤더에서 `{id}`를 추출한다.
- `Location`이 없거나 ID가 비어 있으면 safe error를 반환한다.
- 백엔드 오류 body, 내부 URL, stack trace를 그대로 노출하지 않는다.
- 백엔드 호출은 `buildMysomApiUrl("/v1/menu-category-recommendations")`와
  `cache: "no-store"`를 사용한다.

Idempotency key 정책:

- BFF가 요청마다 UUID를 생성하면 같은 브라우저 재시도도 새 작업이 될 수 있다.
- 클라이언트 mutation에서 `crypto.randomUUID()`로 key를 만들고 request body와 함께
  BFF에 전달하는 방식을 우선한다.
- 같은 선택 payload의 재시도에는 같은 key를 재사용하고, 선택 와인 목록이 바뀌면 새 key를
  만든다.
- BFF는 전달받은 key가 UUID 형식인지 다시 검증하고 백엔드 `Idempotency-Key` 헤더로만
  사용한다.

## 7. Entity 및 Feature 계층

신규 Entity:

```text
web/src/app/entity/menu-category-recommendation/
├─ model/menu-category-recommendation.type.ts
└─ api/
   ├─ menu-category-recommendation.api.ts
   ├─ menu-category-recommendation.mapper.ts
   └─ menu-category-recommendation.server.ts
```

책임:

- DTO와 앱 모델 타입 정의
- 브라우저 BFF 호출 함수 작성
- BFF/서버 응답 mapper 작성
- server-only 백엔드 호출 helper는 Route Handler와 `/wine/keywords` 서버 prefetch에서 재사용

신규 Feature:

```text
web/src/app/feature/menu-category-recommendation-create/
├─ api/
│  └─ use-create-menu-category-recommendation-mutation.ts
├─ lib/
│  ├─ build-create-menu-category-recommendation-request.ts
│  └─ parse-recommendation-location.ts
└─ ui/
   └─ NextRecommendationButton.tsx
```

Feature 책임:

- 선택된 `Wine[]`를 POST request body로 변환한다.
- mutation pending/error 상태를 버튼에 연결한다.
- 성공 시 `/wine/keywords?id={id}`로 이동한다.
- query key는 필요하면 `menuCategoryRecommendationQueryKeys` 별도 파일에서 배열 factory로 둔다.

## 8. 데이터 흐름

```text
사용자 와인 선택
-> selectedWineIds [Zustand]
-> selectedWines [known wines query cache에서 파생]
-> 다음 버튼 클릭
-> buildCreateMenuCategoryRecommendationRequest(selectedWines)
-> useCreateMenuCategoryRecommendationMutation
-> entity API fetch("/api/menu-category-recommendations")
-> BFF validation
-> POST /v1/menu-category-recommendations
-> Location header에서 id 추출
-> router.push("/wine/keywords?id={id}")
```

`selectedWineIds`만 있고 `known wines` cache에 일부 와인 데이터가 없으면 정확한
`name`을 만들 수 없다. 이 경우 다음 버튼을 비활성화하거나 안전한 오류 메시지를 보여주고
요청을 보내지 않는다.

## 9. UI 및 인터랙션

`다음` 버튼 정책:

- 선택 와인이 없으면 기존처럼 버튼을 렌더링하지 않는다.
- 선택 와인이 있으나 카드 데이터가 일부 누락되면 버튼을 disabled 처리한다.
- mutation pending 중에는 버튼을 disabled 처리하고 중복 클릭을 막는다.
- pending 중 텍스트는 `추천 준비 중` 또는 스피너 조합으로 표현한다.
- 실패 시 버튼 근처에 safe error를 표시하고 같은 선택 payload로 재시도할 수 있게 한다.

`shared/ui` 재사용:

- `shared/ui/atom/button`
  - 기존 primary solid 스타일 유지
  - `htmlType="button"` 사용
- `shared/ui/atom/loading-spinner`
  - pending 상태에서 버튼 내부 또는 버튼 아래 상태 표시에 사용
- `shared/ui/molecule/page-header`
  - `page.tsx`의 기존 사용 유지

## 10. Storybook 계획

신규 또는 보완 Story:

- `Feature/menu-category-recommendation-create/NextRecommendationButton`
  - `Default`
  - `Pending`
  - `DisabledMissingWineData`
  - `Error`
- `Feature/wine-list-select/WineListSelectPage`
  - 선택 와인 존재 + 다음 버튼 기본 상태
  - 추천 생성 pending 상태
  - 추천 생성 실패 상태

Story에서는 실제 API 호출을 발생시키지 않고 mutation 상태를 args 또는 mock handler로
재현한다. Story별 QueryClient와 Zustand store를 분리해 상태 누수를 막는다.

## 11. 구현 순서

1. 메뉴 카테고리 추천 Entity 타입과 request/response mapper 작성
2. `POST /api/menu-category-recommendations` BFF Route Handler 작성
3. 브라우저 Entity API 함수 작성
4. 생성 mutation hook 작성
5. 선택 와인 배열을 추천 생성 request로 변환하는 순수 함수 작성
6. `WineListSelectPage`의 기존 `Link` 버튼을 mutation 기반 버튼으로 교체
7. pending/error/disabled 상태 Story 작성
8. `/wine/keywords?id={id}` 계획에 맞춰 결과 페이지와 query key 연결

## 12. 검증

```bash
npx tsc --noEmit
npm run build
npm run build-storybook
```

추가 확인:

- `Idempotency-Key`가 UUID로 전달되는지 확인
- `Location`이 `/v1/menu-category-recommendations/{id}` 형식일 때 ID가 정확히 추출되는지 확인
- 선택 와인이 없거나 데이터가 누락된 경우 요청하지 않는지 확인
- pending 중 중복 클릭이 막히는지 확인
- BFF 오류가 내부 정보를 노출하지 않는지 확인
- 성공 후 `/wine/keywords?id={id}`로 이동하는지 확인

## 13. 완료 기준

- `/wine/ai/page.tsx`는 Server Component로 유지된다.
- 브라우저는 백엔드 origin이 아니라 same-origin BFF만 호출한다.
- 추천 생성은 TanStack Query mutation으로 관리한다.
- 서버 데이터는 Zustand에 저장하지 않는다.
- 추천 작업 ID는 URL query로 전달된다.
- 기존 와인 선택 draft와 known wines cache 구조를 유지한다.
- pending, disabled, error, success 이동 상태가 제공된다.
