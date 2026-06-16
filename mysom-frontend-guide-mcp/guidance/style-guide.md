# Style Guide

`web/AGENTS.md`의 스타일 프로그래밍 정책만 분리한 문서다. 이 문서는 프론트엔드 스타일 구현 시 따라야 할 핵심 기준을 빠르게 확인하는 용도로 사용한다.

## 목적

- 스타일은 감각적으로 임의 작성하지 않고, 레이아웃, 간격, 가독성, 애니메이션 기준으로 설계한다.
- Tailwind CSS는 CSS 원리를 빠르게 표현하는 도구로 사용한다.
- 스타일 문제는 class를 늘려서 덮지 않고, width, flow, alignment, layer 관점에서 원인을 먼저 파악한다.

## 적용 범위

- `className`
- `globals.css`
- component-level style
- animation

## 핵심 원칙

- CSS 원리를 먼저 이해하고 Tailwind로 구현한다.
- 모든 레이아웃은 mobile-first로 설계한다.
- 폭 문제는 정렬이 아니라 width 관계로 해결한다.
- 장식보다 가독성을 우선한다.
- 애니메이션은 정보 구조를 보조할 때만 사용한다.

## 스타일 판단 순서

1. 레이아웃이 왜 깨지는지 `width`, `height`, `overflow`, `display` 기준으로 해석한다.
2. 정렬 문제인지, 크기 문제인지, 간격 문제인지 구분한다.
3. 필요한 최소 Tailwind 클래스만 적용한다.
4. 장식 효과는 구조가 안정된 뒤 마지막에 추가한다.

### 금지에 가까운 지양 사항

- `justify-center`로 폭 문제를 임시 봉합하지 않는다.
- `absolute`로 흐름 문제를 우회하지 않는다.
- 과도한 고정 폭이나 `min-w-*`로 모바일 깨짐을 유발하지 않는다.
- 원인 파악 없이 class를 계속 누적하지 않는다.

## Tailwind 사용 원칙

- class는 레이아웃 → spacing → typography → color → effect 순서로 읽히게 작성한다.
- 하나의 요소에 너무 긴 class를 몰아넣기보다, 역할이 다른 wrapper를 분리한다.
- 반복되는 유틸리티 조합은 공용 컴포넌트 추출을 먼저 검토한다.
- 구조 유틸리티(`w-full`, `max-w-*`, `grid`, `flex`, `gap-*`, `p-*`)를 우선 사용한다.
- 임의값(`w-[237px]`, `mt-[13px]`)은 명확한 이유가 있을 때만 사용한다.
- `!important` 성격의 강제 우선순위 해결은 지양한다.
- 장식용 class가 텍스트 가독성을 해치면 제거를 우선한다.

## 레이아웃 규칙

### Width와 Flow

- 레이아웃 문제는 요소가 normal flow 안에 있는지 먼저 확인한다.
- 부모가 `w-full`이 아니면 자식의 `w-full`이 기대대로 동작하지 않을 수 있다.
- `max-w-*`는 상한값이다. 화면을 채워야 하면 `w-full`과 함께 사용한다.
- `min-w-*`는 모바일 overflow를 만들 수 있으므로 신중히 사용한다.
- `justify-center`는 정렬 도구일 뿐, width 문제의 해결책이 아니다.

### Flex와 Grid

- 1차원 정렬은 `flex`, 2차원 반복 배치는 `grid`를 우선 사용한다.
- 카드 목록, 피드, 썸네일 목록은 `grid`를 우선 검토한다.
- 버튼 그룹, 아이콘 정렬, inline 배치는 `flex`를 우선 사용한다.
- 열 수가 명확하면 `flex-wrap`보다 `grid-cols-*`를 우선한다.

### Mobile-First

- 기본값은 모바일 기준 1열 또는 세로 배치로 둔다.
- 큰 화면 확장은 `sm:`, `md:`, `lg:`로 단계적으로 추가한다.
- 데스크톱 전용 고정 폭을 기본 class로 두지 않는다.
- 모바일에서 `w-full`, `grid-cols-1`, `flex-col`이 자연스럽게 동작하는지 먼저 확인한다.

## Spacing과 Size

- 형제 요소 간격은 `gap-*`을 우선 사용한다.
- 내부 여백은 `padding`, 외부 간격은 `margin`으로 구분한다.
- 같은 역할의 카드/버튼은 radius, shadow, padding scale을 일관되게 유지한다.
- 시각적으로 유사한 컴포넌트가 서로 다른 spacing 체계를 갖지 않도록 한다.

## Typography와 Image

- 텍스트 대비는 장식보다 우선한다.
- 텍스트가 흐리면 색상, opacity, blur, transform 영향을 먼저 점검한다.
- 제목, 본문, 보조 텍스트는 크기와 굵기로 계층을 분리한다.
- `next/image`에서 `fill`을 쓸 때는 가능하면 `sizes`를 함께 제공한다.
- 이미지 비율이 중요하면 부모에 aspect ratio를 먼저 정의하고, `object-cover` 또는 `object-contain`을 의도적으로 선택한다.

## Color와 Effect

- 색상은 의미 전달과 계층 구분을 위해 사용한다.
- shadow는 깊이감을 보조하는 수준으로만 사용한다.
- shadow, blur, gradient를 동시에 강하게 쓰면 가독성 저하를 먼저 의심한다.
- 텍스트 위 장식 레이어는 opacity를 낮추고 콘텐츠 레이어를 분리한다.
- 불투명도 조절은 분위기 보조 용도로만 쓰고, 정보가 흐려지면 즉시 대비를 높인다.

## Animation

- 애니메이션은 없어도 콘텐츠 이해가 가능해야 한다.
- hover, active, open/close 같은 상호작용은 CSS transition 기반을 우선 사용한다.
- JS 없이 가능한 애니메이션은 CSS-only 방식으로 구현한다.
- `transform`, `opacity` 중심 애니메이션을 우선 사용한다.
- `width`, `height`, `top`, `left` 기반 애니메이션은 지양한다.
- 3D transform 사용 시 `backface-visibility`, `preserve-3d`, 텍스트 선명도를 함께 점검한다.
- hover 효과는 미세한 `scale`, `translate`, `opacity` 변화 정도로 제한한다.

## 스타일 디버깅 체크리스트

- 부모에 `w-full`이 있는가
- `max-w-*`만 있고 실제 폭이 없는가
- `min-w-*` 때문에 모바일이 깨지는가
- `justify-center`가 폭 문제를 가리고 있는가
- `absolute`가 normal flow를 탈출해 겹침을 만드는가
- `transform`, `opacity`, `blur` 때문에 텍스트가 흐려지는가

## 참고 자료

- MDN Responsive Web Design
  https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
- web.dev Responsive Web Design Basics
  https://web.dev/articles/responsive-web-design-basics
- MDN backface-visibility
  https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility
- Tailwind Responsive Design
  https://tailwindcss.com/docs/breakpoints
- Tailwind Container / Max Width
  https://tailwindcss.com/docs/container
- Tailwind Box Sizing
  https://tailwindcss.com/docs/box-sizing
- Tailwind Preflight
  https://tailwindcss.com/docs/preflight
