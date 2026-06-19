# Frontend Development Rules

## MUST: `shared/ui` 사용

- `feature/` 하위의 컴포넌트를 개발하거나 수정할 때는 반드시 `shared/ui`의 공통 UI 컴포넌트를 사용한다.
- UI를 구현하기 전에 `src/app/shared/ui`와 각 컴포넌트의 `*.stories.tsx` Storybook 문서를 반드시 확인하고, 기존 컴포넌트의 API, variant 또는 합성 방식으로 요구사항을 해결할 수 있는지 먼저 검토한다.
- 필요한 공통 UI가 없다면 `feature/` 내부에 동일한 역할의 UI를 중복 구현하지 말고, 재사용 가능한 컴포넌트를 `shared/ui`에 먼저 추가한다.
- 신규 공통 컴포넌트는 역할에 따라 `shared/ui/atom` 또는 `shared/ui/molecule`에 추가하고, 사용법과 공개 API를 설명하는 Storybook 스토리를 함께 작성한다.
- `feature/`에서는 `shared/ui/shadcn`을 직접 사용하지 않고 `shared/ui/atom` 또는 `shared/ui/molecule`을 통해 사용한다.

## MUST: MCP 개발 가이드 확인

- 프론트엔드 코드를 개발하거나 수정하기 전에 반드시 `mysom-frontend-guidance-mcp`를 사용해 작업 경로와 내용에 적용되는 개발 가이드를 확인한다.
- MCP가 반환한 관련 가이드를 읽고 상태 관리, 데이터 흐름, RSC/RCC 경계, BFF, 스타일 및 Storybook 규칙을 구현에 반영한다.
- 개발 가이드를 확인하지 않은 상태에서 구현을 시작하지 않는다.
