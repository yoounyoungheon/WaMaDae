## 목적

이 프로젝트에서 AI Agent는  
디자인 시스템(Atom/Molecule)을 조합하여  
feature/\*/ui/ 하위에 Feature UI 컴포넌트를 생성한다.

디자인 시스템의 구체적인 컴포넌트 목록, props, 사용 예시는  
storybook-static/components.meta.json을 단일 소스 오브 트루스(Single Source of Truth) 로 사용한다.

AGENTS.md는 개별 컴포넌트(Button, Dialog 등)에 대해 설명하지 않는다.

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

### 2.2 originalSources는 “팀의 사용 패턴”

originalSources는 단순 코드 문자열이 아니다.  
이는 다음을 의미한다:

- 팀이 선호하는 조합 구조
- props 전달 방식
- variant 비교 방식
- 상태 표현 방식
- Storybook 작성 패턴

Agent는 새로운 Feature UI를 만들 때  
originalSources에서 발견되는 패턴을 최대한 유지한다.

### 2.3 argTypes는 외부 노출 API의 기준

argTypes는 해당 디자인 시스템 컴포넌트의 public control surface이다.

Feature UI는 내부에서 이를 사용할 수 있으나,

모든 argTypes를 그대로 외부에 노출할 필요는 없다.

Feature UI는 도메인 중심 props를 설계한다.

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
- 내부 디자인 시스템 패턴을 유지한 render 구조 사용

## 5. 스토리 작성 규칙

스토리는 다음을 만족해야 한다:

- title: Feature/<feature-name>/<ComponentName>
- tags: ["autodocs"]
- Feature 관점의 argTypes 정의
- 내부적으로 디자인 시스템 컴포넌트 조합 사용

Story 작성 스타일은 components.meta.json의 originalSources에서 발견되는 패턴을 따른다.

## 6. 레이어 규칙

- Agent는 atom/molecule을 새로 만들지 않는다.
- shared/ui 레이어는 수정하지 않는다.
- feature 레이어에만 생성한다.

## 7. 금지 사항

- components.meta.json에 없는 컴포넌트를 임의로 가정하지 않는다.
- 디자인 시스템 구현 파일을 직접 수정하지 않는다.
- 스토리 파일 없이 컴포넌트를 생성하지 않는다.
- Storybook에 등록되지 않는 구조로 만들지 않는다.

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

Agent는 규칙에 따라 지식을 활용해 Feature UI를 생성한다.
