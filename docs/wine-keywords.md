# `/wine/keywords` 메뉴 추천 개발 문서

- 라우트: `web/src/app/wine/keywords/page.tsx`
- 시안: `designs/enhanced_design_2.png`
- API: `api/mysom-wine-pairing.md` (`POST /v1/wine-pairings/recommend-menu`)
- 기준 백엔드: `mysom-api-demo` `68a0cb7`

`/wine/list`에서 선택한 세션 wine으로 추천 메뉴를 조회하고, 다음 페어링에 사용할
**추천 메뉴 name**을 고르는 단계다.

## 페이지 구조와 RSC/RCC 경계

```text
WineKeywordsPage [Server]  (page.tsx)
├─ PageHeader [Server]
└─ MenuCategoryRecommendationPage [Client]
   ├─ Intro
   ├─ RecommendationResult (loading/error/empty/success)
   │  └─ RecommendedMenuList → RecommendedMenuItem[] (name + category badge)
   └─ PairingCta (sticky)
```

- `page.tsx`와 header는 Server Component, page body만 Client Component다.
- 정적 기본 카테고리 그리드(`DefaultMenuCategory*`)는 활성 플로우에서 제거했다.
  백엔드는 현재 세션에 저장된 추천 name만 pairing에서 허용하므로, 임의 카테고리를
  넣으면 `404`가 된다.

## 입력 snapshot과 검증

`/wine/list`가 저장한 `WineSelectionSnapshot`(`version: 2, sessionId, pairingWineIds`)을
hydration 이후 한 번 읽는다(`useStoredWineSelectionSnapshot`). hydration 전에는 loading
shell을 유지하고, snapshot이 없거나 invalid(legacy shape 포함)면 API를 호출하지 않고
`/wine/list` 복귀 액션을 제공한다.

## 상태 관리

| 상태 | 출처 | 관리 |
| --- | --- | --- |
| session ID / pairingWineIds | list snapshot | hydration 후 로컬 읽기 |
| 추천 메뉴 | 서버 상태 | TanStack Query |
| 선택 menu name | 페이지 UI draft | `useState<string[]>` |
| CTA 활성 | 파생값 | 현재 응답에 존재하는 선택 name 개수 |

query key는 세션과 선택 wine을 모두 포함한다.

```ts
["wine-pairings", "recommend-menu", { sessionId, pairingWineIds }]
```

`POST`지만 화면 생명주기 동안 같은 입력을 재사용하는 조회 성격이므로
`staleTime: Infinity`, `refetchOnWindowFocus: false`, `retry: 0`으로 둔다.
자동 refetch/retry는 backend가 세션에 저장하는 추천 결과를 바꿀 수 있어 막는다.

## 데이터·BFF 흐름

```text
selection snapshot 복원
→ POST /api/wine-pairings/recommend-menu  (X-Session-Id, { pairingWineIds })
→ BFF: UUID/배열 개수 검증, 세션은 header로만 전달
→ POST /v1/wine-pairings/recommend-menu
→ { recommendedMenus: [{ name, category }] }
→ mapper: 순서 유지, category enum 검증(알 수 없으면 계약 오류), name trim
→ TanStack Query cache → RecommendedMenuList
→ 사용자가 name 선택 → WinePairingSnapshot 저장 → /wine/chat
```

`mapMenuRecommendationDto`는 응답 순서(AI rank)를 유지하고, `MENU_CATEGORIES` enum에
없는 category는 조용히 바꾸지 않고 오류로 처리한다. 선택 식별자와 다음 요청 값은 `name`이다.

## 다음 페이지 snapshot

```ts
type WinePairingSnapshot = {
  version: 2;
  sessionId: string;
  wineIds: string[];   // = pairingWineIds
  menuNames: string[]; // 현재 응답에 존재하는 선택 name만
};
```

현재 query 응답에 존재하는 선택 name만 `menuNames`로 저장한다(`validSelectedNames`).
정적 카테고리·`category` 문자열·오래된 추천 결과는 섞지 않는다.

## 오류 정책

- 항목은 자동 선택하지 않고, 같은 `name`은 한 번만 선택한다(category는 식별자 아님).
- 조회 성공 전/빈 응답/오류에서는 CTA를 비활성화한다.
- BFF status 매핑: 400(요청 손상), 404(세션·wine 불일치), 409(메뉴 변경), 그 외(재시도).
- 오류 상태는 "다시 시도"(refetch) + "처음부터 다시 시작"(/wine/list) 액션을 함께 제공한다.

## Storybook

- `Feature/menu-category-recommendation-result/RecommendedMenuItem` (default/selected/long/category)
- `Feature/menu-category-recommendation-result/RecommendedMenuList` (default/single/none/max)

## 남은 제약

- 시안의 메뉴 썸네일·설명 문구는 API 계약(`{ name, category }`)에 없어 표시하지 않는다.
- "다시 추천" 버튼은 별도로 두지 않았다. 필요 시 성공 시 selection 초기화를 포함해 추가한다.
