# 0. 프론트엔드 가이드 조회 절차

프론트엔드 개발 작업을 시작하기 전에 반드시
`mysom-frontend-guidance-mcp`를 사용한다 (MUST).

적용 대상에는 구현, 수정, 리팩터링, 코드 리뷰, 계획 작성과 다음 영역의
변경이 포함된다.

- React/Next.js 컴포넌트와 App Router
- 상태 관리와 데이터 흐름
- Route Handler/BFF 및 브라우저 API 호출
- 스타일과 인터랙션
- Storybook과 Feature UI

작업 절차:

1. 작업 설명과 대상 경로를 `resolve_guides`에 전달한다 (MUST).
2. 반환된 가이드가 있으면 우선순위에 따라 각각 `read_guide`로 본문을
   읽는다 (MUST).
3. 읽은 가이드와 이 문서를 함께 기준으로 작업한다 (MUST).
4. 반환된 가이드가 없으면 이 문서와 현재 프로젝트 구조를 기준으로
   진행한다 (ALLOW).
5. 가이드 적용 여부를 추측하거나 기억에 의존하지 않고, 매 프론트엔드
   작업마다 다시 조회한다 (MUST).

# 1. 프로그래밍 정책

## 컴포넌트 개발 정책

### 1. 기본 원칙

- 모든 컴포넌트는 기본적으로 Server Component로 작성해야 한다 (MUST)
- Client Component는 클라이언트 상호작용이 필요한 경우에만 사용해야 한다 (MUST)
- Client Component는 파일 상단에 "use client"를 선언해야 한다 (MUST)

### 2. Server Component 규칙

- 다음 조건에 해당하는 컴포넌트는 Server Component로 작성해야 한다 (MUST)
- 서버에서 데이터를 조회하는 경우
- 페이지 초기 데이터를 렌더링하는 경우
- 정적인 UI를 출력하는 경우
- SEO가 중요한 화면인 경우
- 브라우저 API가 필요 없는 경우
- 사용자 이벤트 처리가 없는 경우
- 다음 파일은 반드시 Server Component로 유지해야 한다 (MUST)
  - page.tsx
  - layout.tsx

### 3. Client Component 규칙

- 다음 조건 중 하나라도 해당하면 Client Component로 분리해야 하는지 먼저 검토한다 (SHOULD)
- useState, useReducer 등 상태 관리가 필요한 경우
- useEffect, useRef 등 클라이언트 실행 이후 동작이 필요한 경우
- onClick, onChange, onSubmit 등 이벤트 처리가 필요한 경우
- window, document, localStorage 등 브라우저 API가 필요한 경우
- 모달, 드롭다운, 탭, 폼 입력 등 인터랙션 UI인 경우
- Client Component는 필요한 범위에서 최소 단위로 분리해야 한다 (SHOULD)

### 4. 빠른 판단 순서

- 아래 질문 중 하나라도 "예"이면 Client Component 분리를 우선 검토한다.
- React hook이 필요한가?
- 사용자 이벤트 처리가 필요한가?
- 브라우저 API가 필요한가?
- 위 질문이 모두 "아니오"이면 Server Component를 기본값으로 사용한다 (SHOULD)

### 5. 페이지와 레이아웃 예외 규칙

- page.tsx와 layout.tsx는 인터랙션이 있더라도 파일 자체는 Server Component로 유지해야 한다 (MUST)
- page.tsx와 layout.tsx에 인터랙션이 필요하면, 상호작용 영역만 별도 Client Component로 분리해서 하위에 배치해야 한다 (MUST)
- 페이지 전체에 "use client"를 선언해서 문제를 해결하는 방식은 지양해야 한다 (SHOULD NOT)
- 좋은 예
  ```
  Page (Server)
  ├ ContentSection (Server)
  └ LikeButton (Client)
  ```
- 나쁜 예
  ```
  Page (Client)
  ├ ContentSection
  └ LikeButton
  ```

### 6. Component Composition 규칙

- 컴포넌트 구조는 다음 패턴을 따라야 한다 (SHOULD)
  ```
  Server Component
    └ Client Component
  ```
- Server Component는 데이터 조회와 초기 렌더링을 담당해야 한다 (SHOULD)
- Client Component는 사용자 인터랙션을 담당해야 한다 (SHOULD)

### 7. Import 규칙

- Server Component는 Client Component를 import 할 수 있다 (ALLOW)
- Client Component는 Server Component를 직접 import 하면 안 된다 (MUST NOT)
- 단, Server Component가 상위에서 렌더링한 결과를 children 또는 props 형태로 전달받는 패턴은 별도로 설계할 수 있다 (ALLOW)
- 잘못된 예
  ```
  Client Component
    └ Server Component
  ```

### 8. "use client" 사용 규칙

- "use client"는 필요한 파일에만 선언해야 한다 (SHOULD)
- 상호작용 영역만 별도 Client Component로 분리해야 한다 (SHOULD)
- 선언 이유가 불명확한 넓은 범위의 Client 전환은 지양해야 한다 (SHOULD NOT)

### 9. 데이터 조회 규칙

- 초기 데이터 조회는 Server Component에서 수행해야 한다 (SHOULD)
- Client Component에서 초기 데이터 fetch를 수행하는 방식은 지양한다 (SHOULD NOT)
- 서버 전용 로직(DB 접근, 인증 처리 등)은 Client Component에 포함하면 안 된다 (MUST NOT)

### 10. 컴포넌트 설계 규칙

- 컴포넌트는 단일 책임 원칙(SRP)을 따라야 한다 (SHOULD)
- 재사용 가능한 UI 컴포넌트는 프레젠테이션 중심으로 작성한다 (SHOULD)

### 11. 핵심 원칙 요약

- 데이터 렌더링은 서버에서 처리한다
- 사용자 인터랙션만 클라이언트에서 처리한다
- "use client" 사용 범위를 최소화한다

# 2. 컴포넌트 디자인 규칙

## 목적

이 프로젝트에서 AI Agent는  
디자인 시스템(Atom/Molecule)을 조합하여  
feature/\*/ui/ 하위에 Feature UI 컴포넌트를 생성한다.

디자인 시스템의 구체적인 컴포넌트 목록, props, 사용 예시에 대해서는  
storybook-static/components.meta.json을 단일 소스 오브 트루스(Single Source of Truth)로 사용한다.

컴포넌트 실행 환경(Server/Client), 파일 생성 위치, 금지 사항 같은 행동 규칙은 AGENTS.md를 기준으로 판단한다.

AGENTS.md는 개별 컴포넌트(Button, Dialog 등)에 대해 설명하지 않는다.

## 0. 적용 범위

- AGENTS.md는 Agent의 행동 규칙과 생성 규칙을 정의한다.
- components.meta.json은 디자인 시스템 지식 베이스를 정의한다.
- 두 문서는 상호 보완 관계이며, 하나가 다른 하나를 완전히 대체하지 않는다.

## 1. 입력 데이터 규약

Agent는 반드시 아래 파일을 기반으로 의사결정을 한다.

### 1.1 components.meta.json

경로:

`storybook-static/components.meta.json`

구조:

```json
{
  "components": [
    {
      "name": "ComponentName",
      "kind": "atom | molecule",
      "componentPath": "...",
      "storiesPath": "...",
      "argTypes": { ... },
      "args": { ... },
      "originalSources": [ "..." ]
    }
  ]
}
```

필드 의미

- name: 컴포넌트 이름
- kind: atom 또는 molecule
- componentPath: 실제 구현 파일 경로
- storiesPath: 스토리 파일 경로
- argTypes: 컴포넌트의 props
- args: 기본 args
- originalSources: 팀이 사용하는 실제 조합/사용 예시

## 2. 디자인 시스템 해석 규칙

Agent는 components.meta.json을 다음과 같이 해석한다.

### 2.1 디자인 시스템 컴포넌트는 수정하지 않는다

componentPath에 해당하는 파일은  
재사용 대상이며 수정 대상이 아니다.

새 UI는 반드시 조합을 통해 만든다.

### 2.2 메타에 없는 primitive가 필요한 경우

- components.meta.json에 없는 atom/molecule이 필요하더라도 shared/ui에 새 primitive를 추가하거나 기존 디자인 시스템 컴포넌트를 수정하지 않는다 (MUST NOT)
- 필요한 primitive가 프로젝트 내부에 존재하지 않으면, Feature UI를 임의 구현으로 완성하지 말고 TODO 주석을 통해 미완성 상태를 명시한다 (MUST)
- 이 TODO 주석에는 최소한 다음 내용을 포함해야 한다 (SHOULD)
  - 현재 필요한 primitive 또는 capability
  - 왜 기존 components.meta.json 조합으로 해결되지 않는지
  - 어떤 위치의 디자인 시스템 확장이 필요한지
- TODO 주석으로 미완성 상태를 남기는 경우에도, 가능한 범위의 Feature UI 골격과 Story는 함께 작성한다 (SHOULD)

### 2.3 originalSources는 “팀의 사용 패턴”

originalSources는 단순 코드 문자열이 아니다.  
이는 다음을 의미한다:

- 팀이 선호하는 조합 구조
- props 전달 방식
- variant 비교 방식
- 상태 표현 방식
- Storybook 작성 패턴

Agent는 새로운 Feature UI를 만들 때  
originalSources에서 발견되는 패턴을 최대한 유지한다.

### 2.4 argTypes는 외부 노출 API의 기준

argTypes는 해당 디자인 시스템 컴포넌트의 public control surface이다.

Feature UI는 내부에서 이를 사용할 수 있으나,

모든 argTypes를 그대로 외부에 노출할 필요는 없다.

Feature UI는 도메인 중심 props를 설계한다.

### 2.5 메타 해석 시 허용 범위

- components.meta.json에 없는 디자인 시스템 컴포넌트를 새로 가정하지 않는다 (MUST NOT)
- 단, Feature UI를 조합하기 위해 Next.js 기본 컴포넌트, 표준 HTML element, feature 전용 wrapper/section 정도의 보조 구조는 사용할 수 있다 (ALLOW)
- 이때도 UI의 핵심 primitive는 가능한 한 components.meta.json에 정의된 atom/molecule 조합으로 해결해야 한다 (SHOULD)

## 3. Agent의 생성 대상

Agent는 아래 경로에만 파일을 생성한다:

`src/app/feature/<feature-name>/ui/`

생성 파일:

- `<ComponentName>.tsx`
- `<ComponentName>.stories.tsx`

## 4. 생성 절차

Agent는 다음 절차를 따른다.

### Step 1 — 요구사항 분석

사용자 요청을 Feature UI 단위로 해석한다.

### Step 2 — 디자인 시스템 검색

components.meta.json에서 적절한 atom/molecule을 검색한다.

검색 기준:

- 이름
- argTypes 키
- originalSources 패턴

필요한 primitive가 검색되지 않으면, 해당 Feature UI는 TODO 주석과 함께 미완성 상태로 남기고 shared/ui 수정 없이 중단한다.

### Step 3 — 조합 설계

atom/molecule을 조합한다.

props는 Feature 관점으로 재설계한다.

디자인 시스템 props를 그대로 노출하지 않는다 (필요한 경우 제외).

### Step 4 — 구현

Feature UI 컴포넌트를 작성한다.

### Step 5 — Story 작성

- Storybook 메타 작성
- Default 스토리 필수
- 주요 상태 스토리 포함
- 팀의 Storybook 패턴을 참고하되, feature 사용 맥락을 재현하는 최소 wrapper 중심의 render 구조 사용
- 미완성 상태인 경우에도 현재 구현 가능한 범위의 상태를 Story에 반영하고, TODO가 남아 있음을 명시한다

## 5. 스토리 작성 규칙

스토리는 다음을 만족해야 한다:

- title: Feature/<feature-name>/<ComponentName>
- tags: ["autodocs"]
- Feature 관점의 argTypes 정의
- 내부적으로 디자인 시스템 컴포넌트 조합 사용

Story 작성 시 components.meta.json의 originalSources를 참고하되, Feature Story는 feature의 공개 API와 사용 맥락을 우선한다.

### 5.1 기본 메타 규칙

- 스토리 파일은 `@storybook/nextjs-vite`에서 `Meta`, `StoryObj`를 import 하는 패턴을 기본으로 사용한다 (SHOULD)
- 기본 메타는 `const meta: Meta<typeof ComponentName> = { ... }` 형태로 작성한다 (SHOULD)
- `export default meta` 이후에는 `type Story = StoryObj<typeof ComponentName>` 별칭을 선언한다 (SHOULD)
- `parameters.layout`은 특별한 이유가 없으면 `"centered"`를 기본값으로 사용한다 (SHOULD)

### 5.2 args와 argTypes 규칙

- `args`에는 컴포넌트를 이해할 수 있는 현실적인 기본 데이터를 제공한다 (SHOULD)
- 단순 문자열, boolean, className 등은 가능한 경우 `argTypes.control`을 명시한다 (SHOULD)
- 배열/객체 기반 도메인 데이터는 `control: "object"`를 우선 사용한다 (SHOULD)
- 함수, ReactNode, 복잡한 콜백처럼 Storybook control에 적합하지 않은 값은 `control: false` 또는 action으로 처리한다 (SHOULD)
- `argTypes` 설명은 디자인 시스템 내부 prop 설명이 아니라 Feature 관점 설명을 우선한다 (SHOULD)

### 5.3 스토리 구성 규칙

- `Default` 스토리는 항상 제공한다 (MUST)
- `Empty`, `Selected`, `WithLinks`, `LongDescription`처럼 사용자가 실제로 확인해야 하는 주요 상태를 추가한다 (SHOULD)
- 상태 차이가 `args`만으로 표현 가능하면 `render`를 중복 작성하기보다 기존 스토리의 `render`를 재사용한다 (SHOULD)
- 스토리 이름은 시각적/도메인 상태를 바로 이해할 수 있게 작성한다 (SHOULD)

### 5.4 render 함수 규칙

- 컴포넌트가 실제 화면에서는 고정 폭 또는 고정 높이 문맥에서 사용된다면, Story에서도 wrapper를 두어 그 문맥을 재현한다 (SHOULD)
- wrapper는 데모를 위한 최소 범위 레이아웃만 제공하고, 컴포넌트 자체의 책임을 대체하지 않는다 (SHOULD)
- `render` 함수는 스토리 시연에 필요한 조합만 담당하고, 컴포넌트 내부 구현을 우회하는 과도한 mocking은 지양한다 (SHOULD NOT)

### 5.5 Feature Story 원칙

- Story는 디자인 시스템 primitive 자체를 설명하는 문서가 아니라, Feature UI가 어떤 데이터와 상태에서 어떻게 보이는지 보여주는 데 집중한다 (SHOULD)
- 디자인 시스템 props를 그대로 나열하기보다, Feature 컴포넌트의 공개 API와 사용 시나리오를 드러내는 방향으로 스토리를 구성한다 (SHOULD)
- TODO 주석과 함께 미완성 상태로 남은 컴포넌트라면, Story에도 현재 구현 범위와 남은 제약이 드러나야 한다 (SHOULD)

## 6. 레이어 규칙

- Agent는 atom/molecule을 새로 만들지 않는다.
- shared/ui 레이어는 수정하지 않는다.
- feature 레이어에만 생성한다.
- shared/ui 확장이 필요하다고 판단되면, Feature UI 내부 TODO 주석으로 그 필요를 명시하고 구현은 중단한다.

## 7. 금지 사항

- components.meta.json에 없는 디자인 시스템 컴포넌트를 임의로 가정하지 않는다.
- 디자인 시스템 구현 파일을 직접 수정하지 않는다.
- 스토리 파일 없이 컴포넌트를 생성하지 않는다.
- Storybook에 등록되지 않는 구조로 만들지 않는다.
- TODO 없이 미완성 상태를 숨긴 채 완성된 것처럼 구현하지 않는다.

## 8. 확장성 원칙

components.meta.json은 자동 생성된다.  
새로운 atom/molecule이 추가되더라도 AGENTS.md는 수정하지 않는다.

Agent는 항상:

- 최신 components.meta.json을 읽고
- 그 안의 구조를 기반으로 동적으로 판단한다.

AGENTS.md는 정책 문서이며,  
디자인 시스템 정의는 components.meta.json이 담당한다.

핵심 철학

- AGENTS.md = 행동 규칙
- components.meta.json = 지식 베이스
