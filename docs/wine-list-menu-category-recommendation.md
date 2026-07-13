# `/wine/list` 메뉴 카테고리 추천 진입 흐름

`/wine/list`(와인 리스트 선택) 화면에서 선택 와인으로 추천 결과 화면(`/wine/keywords`)에
진입하는 흐름을 정리한 문서다. 기준 컴포넌트는
`feature/wine-list-select/ui/NextRecommendationButton.tsx`이다.

이 문서의 코드 경로는 별도 표기가 없으면 `web/src/app/`을 기준으로 한다.
API 계약은 `api/mysom-wine-pairing.md`의
`POST /v1/wine-pairing/menu-category/recommend`를 참고한다.

> 이전 설계는 비동기 작업 생성(`POST /v1/menu-category-recommendations`) + id polling
> 구조였으나, 해당 API가 레거시가 되어 동기 추천 API로 전환했다. 추천 호출 자체는
> 결과 화면(`/wine/keywords`)이 담당하며, 이 화면의 버튼은 이동만 한다.

## 1. 한눈에 보기

```text
wine/list/page.tsx                     [Server Component]
├─ PageHeader                        [Server]  title + routeBackPath="/"
└─ WineListSelectPage                [Client]  "use client"
   ├─ WineMenuPhotoSection
   ├─ WineSearchSection
   ├─ SelectedWineSection
   └─ NextRecommendationButton       [Client]  /wine/keywords로 이동
```

- `page.tsx`는 Server Component로 유지한다.
- 선택 와인이 1개 이상일 때만 `NextRecommendationButton`을 렌더링한다.
- 버튼은 추천 API를 호출하지 않고 `useRouter().push("/wine/keywords")`로 이동만 한다.

## 2. 상태 관리

| 상태 | 출처 | 관리 방식 | 위치 |
| --- | --- | --- | --- |
| 선택된 와인 ID와 순서 | 사용자 draft | Zustand | `wine-list-selection.store.ts` |
| 선택 와인 카드 데이터 | 검색/OCR 응답 서버 데이터 | TanStack Query cache | `known wines` |

선택 draft(Zustand)와 known wines 캐시(TanStack Query)는 `/wine/layout.tsx`의
`WineListSelectionProvider`와 전역 QueryClient 덕분에 `/wine/list ↔ /wine/keywords`
이동 간 유지된다. 결과 화면은 이 두 소스에서 선택 와인을 파생한다.

## 3. 버튼 동작

`NextRecommendationButton`(`wine-list-select` feature):

- `buildMenuCategoryRecommendationRequest(selectedWines)`로 보낼 수 있는 와인 수를 계산한다.
- 보낼 수 있는 와인이 없거나(`request.wines.length === 0`) 카드 데이터가 누락되면
  (`hasMissingWineData`) 버튼을 비활성화한다.
- 클릭 시 `saveMenuCategoryRecommendationRequest(request)`로 선택 payload를
  **sessionStorage에 스냅샷**한 뒤 `/wine/keywords`로 이동한다. 추천 조회는 결과 화면이 수행한다.

`hasMissingWineData`는 `selectedWines.length < selectedWineIds.length`로 계산한다.

## 3-1. 페이지 간 선택 전달 (sessionStorage 스냅샷)

WebView는 브라우저 탭보다 리로드(OS 메모리 회수·네이티브 back)가 잦아, 인메모리 선택만으로는
결과 화면이 쉽게 비워진다. 그래서 `다음` 클릭 시 요청 payload(`{id, name, koreanName}[]`)를
`sessionStorage`에 저장하고, 결과 화면은 이를 source of truth로 읽는다.

- 저장소 helper: `entity/menu-category-recommendation/lib/recommendation-request-storage.ts`
- ID로 와인 상세를 다시 조회하는 API가 없어 `name`/`koreanName`까지 통째로 보존한다.
- 선택은 "한 세션 동안의 draft"이므로 localStorage가 아니라 sessionStorage를 사용한다.
- 이 덕분에 결과 화면 리로드/뒤로가기 후에도 추천 결과가 복원된다.

## 4. `shared/ui` 재사용

- `shared/ui/atom/button`: primary solid, `htmlType="button"`
- `shared/ui/molecule/page-header`: `page.tsx` 기존 사용 유지

## 5. Storybook

`Feature/wine-list-select/NextRecommendationButton`

- `Default`, `DisabledMissingWineData`, `DisabledNoSendableWine`

이동만 담당하므로 API 스텁 없이 args로 비활성화 상태를 재현한다. 라우터는
`@storybook/nextjs-vite`가 기본 mock을 제공한다.
