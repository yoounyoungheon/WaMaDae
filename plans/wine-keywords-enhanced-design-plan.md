# `/wine/keywords` 세션 기반 메뉴 추천 설계

## 1. 범위와 기준

- 대상 라우트: `web/src/app/wine/keywords/page.tsx`
- 화면 시안: `designs/enhanced_design_2.png`
- API 명세: `api/mysom-wine-pairing.md`의 `POST /v1/wine-pairings/recommend-menu`
- 기준 백엔드: `mysom-api-demo` `68a0cb7`
- 적용 가이드: `web/GUIDE.md`, `data-flow-layering`, `bff-api-gateway`, `rsc-rendering`, `rcc-rendering`, `storybook-authoring`
- 범위: 설계만 작성하며 코드는 변경하지 않는다.

이 페이지는 `/wine/list`에서 선택한 session wine으로 추천 메뉴를 조회하고, 사용자가 실제 페어링에 사용할 **추천 메뉴명**을 고르는 단계다.

## 2. 변경 계약과 제품 영향

| 구분 | 현재 프론트 | 변경 계약 | 설계 결정 |
| --- | --- | --- | --- |
| path | `/v1/wine-pairing/menu-category/recommend` | `/v1/wine-pairings/recommend-menu` | 새 path 사용 |
| header | 없음 | `X-Session-Id: UUID` | list snapshot에서 복원 |
| request | `{ wineIds }` | `{ pairingWineIds }` | 필드명 변경 |
| response | `{ menuCategories: [{name}] }` | `{ recommendedMenus: [{name, category}] }` | 객체 모델 보존 |
| pairing input | category 객체 | 정확한 추천 `name` 문자열 | 추천 name만 선택 허용 |

백엔드는 현재 세션에 저장한 추천 menu name만 다음 페어링에서 허용한다. 따라서 프론트 상수인 “기본 카테고리”나 사용자가 임의 입력한 이름을 pairing 요청에 포함하면 `404 PAIRING_MENU_NOT_FOUND`가 발생할 수 있다.

## 3. 페이지 구조

```text
WineKeywordsPage [Server]
├─ PageHeader [Server]
└─ MenuRecommendationPage [Client]
   ├─ IntroSection
   ├─ RecommendationState
   │  ├─ LoadingSpinner
   │  ├─ Error/EmptyPanel
   │  └─ RecommendedMenuList
   │     └─ RecommendedMenuItem[]
   │        ├─ menu name
   │        ├─ category badge
   │        └─ selected check
   └─ PairingCta
```

- `page.tsx`와 정적 header는 Server Component다.
- sessionStorage, query, 선택, router를 쓰는 page body만 Client Component다.
- `Button`, `Card`, `LoadingSpinner`, `PageHeader`는 `shared/ui`를 재사용한다.
- 추천 menu item은 도메인 의미가 있으므로 feature UI에 두고 page/feature story를 작성한다.
- 기존 `DefaultMenuCategoryGrid`는 활성 선택 플로우에서 제거한다. 장식용으로 남길 경우 button semantics와 selected state를 제거해 사용자가 페어링 입력으로 오인하지 않게 한다.

## 4. 입력 snapshot과 검증

```ts
type MenuRecommendationSnapshotV2 = {
  version: 2;
  sessionId: string;
  pairingWineIds: string[];
};
```

- `/wine/list` CTA가 선택한 UUID를 dedupe하고 snapshot을 저장한 뒤 이동한다.
- `sessionId`와 wine ID를 하나의 versioned 객체에 저장해 서로 다른 세션 값이 섞이지 않게 한다.
- hydration 전에는 “요청 없음” empty state를 렌더하지 않고 loading shell을 유지한다.
- snapshot이 없거나 invalid면 API를 호출하지 않고 `/wine/list` 복귀 액션을 제공한다.
- legacy `{ wineIds }` snapshot은 묵시적으로 변환하지 않고 invalid 처리한다. 사용자가 새 추출 세션부터 시작하게 한다.

## 5. 상태 관리

| 상태 | 출처 | 관리 방식 |
| --- | --- | --- |
| session ID / 선택 wine IDs | 이전 페이지 snapshot | hydration 후 로컬 읽기 |
| 추천 메뉴 | backend server state | TanStack Query |
| 선택 menu names | 현재 페이지 UI draft | `useState<string[]>` |
| CTA 활성 | query 성공 + 선택 개수 | 파생값 |

추천 응답을 Zustand나 별도 `useState`에 복제하지 않는다. query key에는 세션과 선택 wine을 모두 포함한다.

```ts
["wine-pairings", "recommend-menu", { sessionId, pairingWineIds }]
```

`POST`지만 같은 입력을 화면 생명주기 동안 재사용하는 조회 성격이므로 TanStack Query를 유지할 수 있다. 다만 backend가 추천 결과를 세션에 저장하므로 자동 refetch는 결과를 바꿀 수 있다. `staleTime: Infinity`, `refetchOnWindowFocus: false`, 자동 retry 없음으로 두고 사용자의 명시적 “다시 추천”만 새 호출을 만든다.

## 6. 데이터 및 BFF 흐름

```text
sessionStorage snapshot 복원
-> POST /api/wine-pairings/recommend-menu
   Header X-Session-Id
   { pairingWineIds }
-> BFF UUID/배열 개수 검증
-> POST /v1/wine-pairings/recommend-menu
   Header X-Session-Id
   { pairingWineIds }
-> { recommendedMenus: [{ name, category }] }
-> DTO schema 검증 후 TanStack Query cache
-> 사용자가 recommendedMenus[].name 선택
-> { version, sessionId, wineIds, menuNames } snapshot 저장
-> /wine/chat 이동
```

BFF는 `X-Session-Id`를 body로 옮기지 않고 명시적 header로 전달한다. backend 오류 body는 status만 참고해 safe response로 바꾼다.

```ts
type RecommendedMenu = {
  name: string;
  category:
    | "기타" | "붉은 고기" | "돼지고기" | "가금류" | "해산물"
    | "파스타 및 면" | "밥" | "채소" | "치즈" | "빵" | "디저트";
};
```

mapper는 response 순서를 유지한다. 알 수 없는 category를 조용히 다른 값으로 바꾸지 않고 계약 오류로 처리한다. selection key와 다음 요청 값은 `name`이다.

## 7. 상호작용과 오류 정책

- 추천 항목은 처음에 자동 선택하지 않는다.
- 같은 `name`은 한 번만 선택하며 category는 식별자가 아니다.
- 추천 조회 성공 전, 빈 응답, 오류 상태에서는 CTA를 비활성화한다.
- `400`: snapshot/request 손상으로 보고 list부터 다시 시작 안내
- `404`: session 또는 wine 불일치로 보고 local workflow를 폐기하고 list 복귀
- `409 WINE_MENU_CHANGED`: 이전 단계부터 다시 분석하도록 안내
- `500/502`: 현재 snapshot을 유지하고 명시적 재시도 제공
- “다시 추천” 성공 시 기존 selection을 모두 초기화해 이전 허용 목록의 name을 보내지 않는다.

## 8. 다음 페이지 snapshot

```ts
type WinePairingSnapshotV2 = {
  version: 2;
  sessionId: string;
  wineIds: string[];
  menuNames: string[];
};
```

`menuNames`는 현재 query response에 존재하는 선택된 `name`만 사용한다. 정적 기본 카테고리, `category` 문자열, 오래된 추천 결과를 섞지 않는다.

## 9. 파일별 구현 범위

```text
web/src/app/wine/keywords/page.tsx
web/src/app/feature/menu-category-recommendation-result/**
web/src/app/entity/menu-category-recommendation/**
web/src/app/entity/wine-pairing-workflow/**
web/src/app/api/wine-pairings/recommend-menu/route.ts
```

기존 same-origin BFF path를 유지할 수는 있지만 새 backend 용어와의 혼동을 줄이기 위해 `/api/wine-pairings/recommend-menu`로 정렬하는 것을 권장한다.

## 10. Storybook·검증 범위

- item: 기본/선택/긴 name/각 category/focus-visible
- list: 1개/6개/중복 없는 순서/좁은 화면
- page: hydration, snapshot 없음, loading, success, empty, 400/404/409/500, 재추천
- query: session ID가 다르면 cache가 분리되는지 검증
- BFF: header 누락/invalid UUID, 빈/과다 `pairingWineIds`, backend status mapping, invalid response category
- keyboard와 screen reader에서 checkbox 선택 상태가 전달되는지 확인

## 11. 완료 기준

- 같은 `X-Session-Id`와 `pairingWineIds`로 추천 API를 호출한다.
- 메뉴의 `name`과 `category`를 손실 없이 표시한다.
- 서버가 반환하지 않은 메뉴는 페어링 선택값이 될 수 없다.
- 선택한 `recommendedMenus[].name`만 다음 페이지의 `menuNames`로 저장된다.
- stale/invalid session은 자동 보정하지 않고 워크플로 재시작으로 복구한다.
