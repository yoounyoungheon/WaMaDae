# `/wine/list` 메뉴 카테고리 추천 진입 계획

> 보관 문서: 이 계획은 이전 API 계약을 설명한다. 현재 설계는 [`/wine/list` 세션 기반 와인 메뉴 추출 설계](./wine-list-enhanced-design-plan.md)를 기준으로 한다.

## 1. 기준

- 대상 라우트: `web/src/app/wine/list/page.tsx`
- 다음 라우트: `web/src/app/wine/keywords/page.tsx`
- API 명세: `api/mysom-wine-pairing.md`
- 제거된 API 참고: `api/mysom-menu-category-recommendations.md`
- 적용 가이드: `data-flow-layering`, `bff-api-gateway`, `rsc-rendering`, `rcc-rendering`, `storybook-authoring`, `style-implementation`

이 문서는 과거 비동기 메뉴 카테고리 추천 생성 계획을 대체한다. 최신 `mysom-api`에는 메뉴 카테고리 추천 작업 생성 API가 없으므로, 이 단계에서는 추천 작업을 생성하지 않는다.

## 2. 현재 계약

제거된 레거시 흐름:

```text
POST /api/menu-category-recommendations
-> POST /v1/menu-category-recommendations
-> Location: /v1/menu-category-recommendations/{id}
-> /wine/keywords?id={id}
```

최신 흐름:

```text
/wine/list
-> 사용자가 와인을 선택한다.
-> 선택 와인 ID와 카드 데이터는 wine flow provider/query cache에 유지한다.
-> 다음 버튼 클릭
-> /wine/keywords 로 이동한다.
-> /wine/keywords 화면이 선택 와인을 읽어 POST /v1/wine-pairing/menu-category/recommend 를 호출한다.
```

## 3. 페이지 책임

`/wine/list`는 와인 선택까지만 담당한다.

- 메뉴 이미지 OCR 또는 검색 결과로 와인 후보를 표시한다.
- 선택된 와인 ID는 `WineListSelectionProvider`의 Zustand draft에 저장한다.
- 카드 표시용 와인 데이터는 TanStack Query `known wines` cache에 저장한다.
- 선택 와인이 1개 이상이면 다음 단계로 이동할 수 있다.
- 메뉴 카테고리 추천 API는 이 화면에서 호출하지 않는다.
- `Idempotency-Key`, `Location` 헤더, 추천 작업 ID, polling 상태는 이 플로우에서 사용하지 않는다.

## 4. 이동 정책

`NextRecommendationButton` 또는 현재 하단 다음 버튼은 다음 정책을 따른다.

- 선택 와인이 없으면 버튼을 숨기거나 비활성화한다.
- 선택 ID는 있지만 `known wines` cache에 카드 데이터가 없는 항목이 있으면 버튼을 비활성화한다.
- 클릭 시 `buildMenuCategoryRecommendationRequest(selectedWines)` 결과를 sessionStorage에 저장한 뒤 `router.push("/wine/keywords")`를 수행한다.
- `/wine/keywords`가 리로드되어도 선택 데이터가 없으면 빈 상태와 `/wine/list` 복귀 액션을 보여준다.

## 5. Source Of Truth 결정

`/wine/list`에서 `/wine/keywords`로 넘어갈 때의 source of truth는 `sessionStorage` 스냅샷이다.

이유:

- `/wine/keywords`는 페이지 리로드 또는 WebView 복귀 후에도 선택 와인 이름을 알아야 한다.
- 현재 `mysom-api`에는 선택 와인 ID만으로 프론트 카드/추천 요청에 필요한 `name`, `koreanName`을 재조회하는 공개 API가 없다.
- Zustand draft와 TanStack Query cache는 정상 라우트 이동 중에는 유지되지만, 리로드 복원 보장은 `sessionStorage`가 담당한다.

따라서 `/wine/list`의 다음 버튼은 다음 순서를 반드시 지킨다.

```text
selectedWineIds
-> known wines cache에서 Wine[] 파생
-> buildMenuCategoryRecommendationRequest(Wine[])
-> request.wines.length > 0 검증
-> saveMenuCategoryRecommendationRequest(request)
-> router.push("/wine/keywords")
```

Zustand에는 와인 객체를 저장하지 않는다. `sessionStorage` 값은 읽는 쪽에서 다시 shape 검증한다.

## 6. 파일별 구현 계획

```txt
web/src/app/feature/wine-list-select/ui/NextRecommendationButton.tsx
web/src/app/feature/wine-list-select/ui/WineListSelectPage.tsx
web/src/app/feature/wine-list-select/model/use-wine-list-select-controller.ts
web/src/app/entity/menu-category-recommendation/lib/build-menu-category-recommendation-request.ts
web/src/app/entity/menu-category-recommendation/lib/recommendation-request-storage.ts
web/src/app/entity/menu-category-recommendation/model/menu-category-recommendation.type.ts
```

### `build-menu-category-recommendation-request.ts`

- 입력은 `Wine[]`다.
- `id`, `name`이 공백인 와인은 제외한다.
- 현재 앱 모델에 별도 `koreanName`이 없으므로 `koreanName`은 `wine.name`으로 채운다.
- 추후 `Wine` 모델에 원어명/한글명이 분리되면 이 함수만 수정한다.

### `recommendation-request-storage.ts`

- 저장 key는 현재 `wamadae:menu-category-recommendation-request`를 유지한다.
- 저장 값은 `{ wines: [{ id, name, koreanName }] }` 형태만 허용한다.
- `load`는 `id/name/koreanName`이 모두 공백 아닌 문자열일 때만 반환한다.
- 파싱 실패, 비활성 storage, 잘못된 shape은 `null`로 처리한다.

### `WineListSelectPage` / Controller

- `selectedWines`는 `selectedWineIds`와 `known wines` cache에서 파생한다.
- 다음 버튼 활성 조건은 `selectedWineIds.length > 0`이 아니라 `buildMenuCategoryRecommendationRequest(selectedWines).wines.length > 0`이다.
- 클릭 핸들러는 네트워크 요청을 하지 않는다.
- 성공/실패 mutation UI는 제거한다.

### 제거 대상

아래 파일이나 동등한 책임의 코드가 남아 있으면 삭제한다.

```txt
web/src/app/api/menu-category-recommendations/route.ts
web/src/app/feature/menu-category-recommendation-create/api/use-create-menu-category-recommendation-mutation.ts
web/src/app/feature/menu-category-recommendation-create/lib/parse-recommendation-location.ts
```

현재 저장소에 해당 파일이 없으면 새로 만들지 않는다.

## 7. 구현 순서

1. 제거된 비동기 추천 생성 관련 파일 존재 여부를 확인한다.
2. `buildMenuCategoryRecommendationRequest`의 입력/출력 테스트 또는 story fixture를 최신 타입에 맞춘다.
3. `/wine/list` 다음 버튼의 활성 조건을 추천 요청 builder 결과 기준으로 조정한다.
4. 클릭 시 `saveMenuCategoryRecommendationRequest` 후 `/wine/keywords`로 이동하도록 연결한다.
5. `/wine/keywords?id={id}`로 이동하는 코드와 테스트 fixture를 제거한다.
6. 리로드 후 `/wine/keywords`가 저장된 request를 읽는지 수동 확인한다.

## 8. 완료 기준

- `/wine/list`에서 메뉴 카테고리 추천 백엔드 호출이 발생하지 않는다.
- `/wine/list`의 다음 동작은 선택 상태 검증 후 `/wine/keywords` 이동만 수행한다.
- `/wine/keywords`는 선택 와인으로 동기 추천 API를 직접 조회한다.
- 코드와 문서에 `/v1/menu-category-recommendations`, `Idempotency-Key`, `Location` 파싱이 활성 플로우처럼 남아 있지 않다.
