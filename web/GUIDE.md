# Frontend Development Rules

## MUST: `shared/ui` 사용

- `feature/` 하위의 컴포넌트를 개발하거나 수정할 때는 반드시 `shared/ui`의 공통 UI 컴포넌트를 사용한다.
- `feature/`에서는 `shared/ui/shadcn`을 직접 사용하지 않고 `shared/ui/atom` 또는 `shared/ui/molecule`을 통해 사용한다.

### 공통 UI 구현 우선순위

공통 UI가 필요한 경우 다음 순서로 검토한다.

1. `shared/ui/atom`, `shared/ui/molecule`의 기존 컴포넌트와 Storybook 스토리를 확인하고 그대로 재사용한다.
2. 기존 컴포넌트의 variant 또는 합성으로 해결할 수 있으면 기존 공개 API를 확장한다.
3. `shared/ui/shadcn`에 이미 설치된 primitive가 있으면 이를 atom 또는 molecule로 감싸서 사용한다.
4. 적절한 primitive가 없으면 `mysom-frontend-guidance-mcp`의 `shadcn-ui-mcp` 가이드를 읽고 shadcn MCP로 후보, 사용 예시 및 의존성을 조사한다.
5. 후보를 결정한 뒤 변경될 파일과 의존성을 확인하고 프로젝트에 추가한다.
6. shadcn/ui로도 해결하기 어렵거나 프로젝트 고유 UI인 경우에만 직접 구현한다.

신규 또는 확장된 공통 컴포넌트는 역할에 따라 `shared/ui/atom` 또는 `shared/ui/molecule`에 두고, 사용법과 공개 API를 설명하는 Storybook 스토리를 함께 작성한다. `feature/` 내부에는 동일한 역할의 UI를 중복 구현하지 않는다.

## MUST: MCP 개발 가이드 확인

- 프론트엔드 코드를 개발하거나 수정하기 전에 반드시 `mysom-frontend-guidance-mcp`를 사용해 작업 경로와 내용에 적용되는 개발 가이드를 확인한다.
- MCP가 반환한 관련 가이드를 읽고 상태 관리, 데이터 흐름, RSC/RCC 경계, BFF, 스타일 및 Storybook 규칙을 구현에 반영한다.
- 개발 가이드를 확인하지 않은 상태에서 구현을 시작하지 않는다.
- 설계, 계획 작성, 구현, 리뷰 및 문서화의 모든 과정에서 `mysom-frontend-guidance-mcp`의 관련 정책을 준수한다.

## MUST: 페이지 단위 개발 워크플로

저장소 루트에는 `web/`과 같은 레벨에 다음 디렉터리가 있다.

- `design/`: 화면 UI 원본
- `api/`: 백엔드 API 명세 문서
- `plans/`: 구현 전 설계 및 계획 문서
- `docs/`: 구현 후 개발 문서

### 1. 디자인 분석

- 화면 구현을 시작하기 전에 `design/`에서 대상 페이지의 UI 이미지를 확인한다.
- 디자인 파일은 `p{number}_{number}.png` 형식을 사용한다.
- 같은 첫 번째 번호를 가진 디자인 파일은 하나의 페이지에 속한 화면 또는 상태로 간주하고 함께 분석한다.
- 디자인에서 레이아웃, 컴포넌트 계층, 사용자 인터랙션, 상태 변화, 반응형 동작 및 필요한 데이터를 분석한다.

### 2. API 문서 분석

- 페이지에서 서버 데이터를 조회하거나 변경하는 경우 구현 전에 `api/`에서 관련 API 문서를 반드시 확인한다.
- HTTP method, endpoint, path/query parameter, request body, response DTO, error response, 인증 방식 및 스트리밍 여부를 확인한다.
- API 문서의 명세를 프론트엔드 요구사항에 맞게 임의로 변경하거나 문서에 없는 필드를 가정하지 않는다.
- 필요한 API 문서가 없거나 명세가 정해지지 않은 경우 임의 구현하지 않고, 미정 항목과 프론트엔드에서 필요한 계약을 `plans/` 문서에 명시한다.
- 브라우저 호출, BFF Route Handler, 서버 상태 및 캐시 구조는 API 문서와 `mysom-frontend-guidance-mcp`의 `bff-api-gateway`, `data-flow-layering` 정책을 함께 기준으로 설계한다.

### 3. 구현 계획 작성

- 디자인 분석 후 코드를 작성하기 전에 페이지 구조와 구현 계획을 `plans/`에 Markdown 문서로 작성한다.
- 계획에는 페이지 구조, 컴포넌트 책임, RSC/RCC 경계, 상태 관리, 데이터 흐름, 참조한 API 명세와 API/BFF 처리, `shared/ui` 재사용 및 Storybook 작성 범위를 포함한다.
- 계획을 작성할 때 반드시 `mysom-frontend-guidance-mcp`에서 관련 가이드를 확인하고 설계에 반영한다.
- 계획 문서는 여러 페이지를 하나의 문서에 합치지 않고 페이지 단위로 분리한다.

### 4. 구현

- 구현은 해당 페이지의 디자인 이미지, 관련 `api/` 문서 및 `plans/` 문서를 기준으로 진행한다.
- 구현 전과 구현 중에 적용 범위가 달라지면 `mysom-frontend-guidance-mcp`를 다시 확인한다.
- 계획과 다른 구조가 필요해진 경우 구현 내용과 계획 문서의 정합성을 맞춘다.
- API 명세가 변경되면 관련 타입, Entity API 함수, Query/Mutation, BFF Route Handler, 계획 문서 및 개발 문서의 정합성을 함께 확인한다.

### 5. 개발 문서 작성

- 구현이 끝나면 개발한 내용을 `docs/`에 Markdown 문서로 정리한다.
- 문서에는 실제 페이지 구조, UI 구성, 비즈니스 로직, 상태 관리, 참조한 API 명세, 데이터 및 API/BFF 흐름, 주요 사용자 인터랙션과 구현 시 결정한 사항을 포함한다.
- 개발 문서도 여러 페이지를 하나의 문서에 합치지 않고 페이지 단위로 분리한다.

### 6. Markdown 문서 단위

- `plans/`와 `docs/`의 모든 Markdown 문서는 페이지 단위로 작성한다.
- 하나의 Markdown 문서는 하나의 페이지 또는 하나의 라우트만 설명한다.
- 동일 페이지의 여러 디자인 상태는 해당 페이지 문서 안에서 함께 설명할 수 있다.
