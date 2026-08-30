# `/wine/list` 개선 디자인 구현 계획

## 1. 범위와 기준

- 대상 라우트: `web/src/app/wine/list/page.tsx`
- 대상 시안: `designs/enhanced_design_1.png`
- 활성 API 명세: `api/mysom-api.md`
- 적용 가이드: `rsc-rendering`, `rcc-rendering`, `data-flow-layering`, `css-only-state`, `style-implementation`, `storybook-authoring`
- 목적: 기존 OCR/직접 검색/와인 선택 흐름은 유지하고, 첫 진입 화면의 정보 계층과 업로드 중심 동선을 시안에 맞게 개선한다.

이번 작업은 UI 개선이다. OCR 요청 형식, 검색 API, 선택 store, `/wine/keywords`로 전달하는 `sessionStorage` 스냅샷 계약은 변경하지 않는다.

### 후속 조정 (2026-08-23)

- 첫 화면의 타이포를 기존 계획보다 한 단계 작게 적용한다.
- 와인 이름 직접 검색 섹션과 "또는" 구분선은 현재 화면에서 제외한다. 검색 기능 코드는 삭제하지 않고 후속 재노출 범위로 유지한다.
- 사진이 없거나 분석 중이면 "와인 리스트 분석" 버튼은 `disabled`다.
- 업로드 프레임과 분석 버튼은 `backdrop-blur-xl`, 반투명 white layer, inset highlight를 사용한 glass 표현으로 강화한다.

## 2. 화면 구조

```text
WineListPage [Server]
├─ PageHeader [Server]
│  ├─ 원형 뒤로가기 아이콘 버튼
│  └─ 가운데 정렬 제목 "와인 리스트 선택"
└─ WineListSelectPage [Client]
   ├─ IntroSection
   │  ├─ "메뉴판을 찍으면 와인 리스트를 읽어드려요"
   │  └─ 보조 설명
   ├─ WineMenuPhotoSection
   │  ├─ 접기/펼치기 버튼
   │  ├─ PhotoUploadBox
   │  ├─ 분석 오류/진행 상태
   │  └─ "와인 리스트 분석" 버튼
   ├─ SelectedWineSection
   └─ NextRecommendationButton (선택 시 하단 고정)
```

## 3. 시각 구현 원칙

- 모바일 우선으로 구성하고, 콘텐츠 폭은 모바일에서는 전체 폭, 큰 화면에서는 읽기 좋은 최대 폭으로 중앙 정렬한다.
- 화면 배경은 `canvas` 단색 위에 `violet-haze` radial gradient 한 겹만 사용한다. 추가 blur나 장식 gradient는 겹치지 않는다.
- 헤더는 기존 `PageHeader`에 가운데 제목 정렬 variant를 추가해 세 화면에서 공유한다. 뒤로가기 영역은 최소 44px 터치 타깃을 유지한다.
- 인트로 제목은 실제 페이지 제목보다 한 단계 아래인 `h2`로 두고, 2줄까지 자연스럽게 줄바꿈되도록 한다.
- 업로드 영역은 고정 최소 높이와 반응형 폭을 사용해 파일명, 로딩, 미리보기 전환에도 레이아웃이 흔들리지 않게 한다.
- 빈 업로드 상태는 `Camera` 아이콘과 텍스트로 표현한다. 이미지 선택 후에는 기존 `next/image` 미리보기와 파일명 표시를 유지한다.
- 업로드/분석 버튼, 검색 입력, 선택 와인 영역은 같은 radius·border·shadow scale을 사용한다. 중첩 카드 구조는 만들지 않는다.
- 접힌 상태에서는 제목과 펼치기 액션만 남기며, 오류가 있는 동안 접혀 오류가 사라지는 상황은 피한다.

### 확정 색상 토큰

`web/tailwind.config.ts`에 아래 semantic token과 배경 이미지를 추가하고 이 화면의 임의 hex 색상을 대체한다.

| 용도 | Tailwind token | 값 |
| --- | --- | --- |
| 본문·페이지 타이틀 | `ink-page` | `#241C3D` |
| 카드 타이틀 | `ink-card` | `#2A2148` |
| 강조·밝은 버튼 라벨 | `ink-emphasis` | `#332853` |
| 세컨더리 설명문 | `ink-secondary` | `#645986` |
| 캡션·muted·placeholder | `ink-muted` | `#6F6488` |
| 화면 배경 | `canvas` | `#F4F3F6` |
| 액션·선택 accent | `primary` | `#6E3AF5` |

```ts
backgroundImage: {
  "violet-haze":
    "radial-gradient(80% 30% at 50% 4%, rgba(129, 88, 255, 0.12) 0%, rgba(129, 88, 255, 0) 72%)",
}
```

- 페이지 shell은 `bg-canvas bg-violet-haze`를 함께 사용한다.
- `ink-secondary`, `ink-muted`는 `canvas` 기준 WCAG AA를 만족하는 확정값이므로 opacity를 더 낮춰 본문 텍스트를 흐리게 만들지 않는다.
- 기존 `text-01`/`primary-main` 값을 즉시 전역 변경하지 않고 새 token을 추가해 이번 와인 플로우부터 적용한다. 전역 migration은 별도 범위로 둔다.

## 4. 컴포넌트 책임과 변경 대상

### 공통 UI

- `shared/ui/molecule/page-header.tsx`
  - 가운데 정렬 제목 옵션과 시안형 원형 뒤로가기 스타일을 공개 API로 제공한다.
  - 기존 사용 화면이 깨지지 않도록 현재 정렬을 기본값으로 유지한다.
- `shared/ui/molecule/page-header.stories.tsx`
  - 기본형, 가운데 정렬형, 긴 제목 상태를 추가한다.
- `shared/ui/atom/button`, `shared/ui/atom/text-input`
  - 기존 variant로 해결 가능한지 먼저 확인한다. 시안 전용 색을 공용 API에 억지로 추가하지 않고 `className` 조합을 최소화한다.
- `tailwind.config.ts`
  - `canvas`, `primary`, `ink-*`, `violet-haze`를 재사용 가능한 token으로 등록한다.

### Feature UI

- `WineListSelectPage.tsx`: 인트로, 섹션 간 간격, 구분선, 스크롤/하단 CTA 레이아웃을 조합한다.
- `WineMenuPhotoSection.tsx`: 제목 문구, 접기 액션, 분석 버튼과 상태 배치를 정리한다.
- `PhotoUploadBox.tsx`: 카메라 중심 빈 상태와 안정적인 미리보기 프레임을 구현한다.
- `WineSearchSection.tsx`: 컴포넌트와 debounce/query 로직은 유지하지만 현재 페이지 조합에서는 렌더링하지 않는다.
- `SelectedWineSection.tsx`, `NextRecommendationButton.tsx`: 선택 후 화면에서도 하단 CTA와 목록이 겹치지 않도록 safe-area와 여백을 검증한다.

## 5. RSC/RCC와 상태 관리

- `wine/list/page.tsx`와 `wine/layout.tsx`는 Server Component로 유지한다.
- 파일 입력, 접기/펼치기, 검색, 선택 이벤트가 있는 `WineListSelectPage` 하위만 Client Component로 유지한다.
- 접기/펼치기는 현재 컨트롤러의 로컬 UI 상태를 유지한다. 페이지가 이미 복합 Client 화면이므로 별도 CSS-only 입력 상태를 중복 도입하지 않는다.
- 검색/OCR 서버 상태는 기존 TanStack Query와 mutation 흐름을 유지한다.
- 선택한 와인 ID는 기존 flow-scoped Zustand store, 표시 데이터는 known-wines query cache를 계속 사용한다.
- 기존 값에서 계산되는 `selectedWines`, 버튼 활성 조건은 별도 상태로 복제하지 않는다.

## 6. 데이터와 API/BFF 흐름

```text
메뉴 이미지 선택
-> POST /api/wine-lists/analyze
-> BFF가 POST /v1/wine-pairing/wines/menu-ocr 호출
-> Wine[] cache + selectedWineIds 갱신

와인 이름 검색
-> 기존 검색 query/API 흐름 유지
-> 결과 선택 시 Wine[] cache + selectedWineIds 갱신

다음 단계
-> 선택 UUID로 MenuCategoryRecommendationRequest 생성
-> sessionStorage 스냅샷 저장
-> /wine/keywords 이동
```

활성 계약은 `api/mysom-api.md`를 기준으로 한다. 이전 `api/mysom-wine-pairing.md`의 숫자 ID 또는 `wines[]` 계약을 다시 도입하지 않는다.

## 7. Storybook 및 검증

- `WineListSelectPage`: 초기 상태, 이미지 선택, 분석 중, 분석 오류, 선택 와인 있음.
- `PhotoUploadBox`: 빈 상태, 미리보기, 로딩, 비활성, 긴 파일명.
- `WineMenuPhotoSection`: 펼침/접힘과 오류 상태.
- `WineSearchSection`: 빈 검색, 로딩, 오류, 긴 검색 결과.
- 키보드로 업로드/검색/뒤로가기/다음 버튼에 접근 가능한지 확인한다.
- 320px, 390px, 768px 이상 폭과 짧은 모바일 높이에서 스크롤 및 하단 CTA 겹침을 확인한다.
- `npm run build-storybook`, 프로젝트 build/type 검사, Playwright 모바일/데스크톱 스크린샷으로 검증한다.

## 8. 완료 기준

- 시안의 헤더, 인트로, 업로드 중심 계층, 구분선, 직접 검색 흐름이 구현된다.
- OCR/검색/선택/다음 단계의 기존 동작과 요청 계약은 유지된다.
- 긴 텍스트, 로딩, 오류, 미리보기, 하단 CTA가 서로 겹치거나 레이아웃을 밀어내지 않는다.
- 공통 헤더 변경이 다른 라우트의 기본 스타일을 회귀시키지 않는다.
