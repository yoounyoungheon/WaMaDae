# shadcn/ui MCP 활용 가이드

## 언제 사용하는가

- 아래의 공통 UI 구현 우선순위에서 기존 컴포넌트, 기존 API 확장 및 설치된 primitive로 해결되지 않을 때 shadcn MCP를 사용한다.
- 단순한 문구·레이아웃·색상 변경에는 shadcn MCP가 필요하지 않다.
- `mysom-frontend-guidance-mcp`는 작업에 적용할 개발 규칙을 제공하고, 별도의 `shadcn` MCP는 컴포넌트 레지스트리를 탐색한다. 두 서버의 역할을 구분한다.

## 공통 UI 구현 우선순위

1. `shared/ui/atom`, `shared/ui/molecule`의 기존 컴포넌트와 Storybook 스토리를 확인하고 그대로 재사용한다.
2. 기존 컴포넌트의 variant 또는 합성으로 해결할 수 있으면 기존 공개 API를 확장한다.
3. `shared/ui/shadcn`에 이미 설치된 primitive가 있으면 이를 atom 또는 molecule로 감싸서 사용한다.
4. 적절한 primitive가 없으면 이 가이드에 따라 shadcn MCP로 후보, 사용 예시 및 의존성을 조사한다.
5. 후보를 결정한 뒤 변경될 파일과 의존성을 확인하고 프로젝트에 추가한다.
6. shadcn/ui로도 해결하기 어렵거나 프로젝트 고유 UI인 경우에만 직접 구현한다.

어떤 경우에도 `feature/`에서 `shared/ui/shadcn`을 직접 import하지 않는다. 신규 또는 확장된 공통 컴포넌트에는 Storybook 스토리를 함께 작성한다.

## 도구별 사용 시점

현재 등록된 shadcn MCP의 도구 이름을 기준으로 한다. 실제 입력 스키마와 사용 가능 여부는 연결된 서버의 도구 설명을 확인한다.

| 도구 | 사용 시점 |
| --- | --- |
| `get_project_registries` | 이 프로젝트에서 조회 가능한 레지스트리를 확인할 때 |
| `list_items_in_registries` | 특정 레지스트리의 컴포넌트 목록을 훑어볼 때 |
| `search_items_in_registries` | 필요한 기능이나 컴포넌트 이름으로 후보를 찾을 때 |
| `view_items_in_registries` | 후보의 구성 파일, 의존성, 구현 내용을 검토할 때 |
| `get_item_examples_from_registries` | 후보의 실제 사용 패턴과 조합 예시를 볼 때 |
| `get_add_command_for_items` | 도입할 항목을 결정한 뒤 설치 명령을 얻을 때. 명령 반환 자체가 설치는 아니다. |
| `get_audit_checklist` | 도입 후 점검할 항목을 확인할 때 |

## 프로젝트 적용 흐름

1. 위 우선순위의 1~3단계로 재사용·확장 가능성을 먼저 판단한다.
2. 새 primitive가 필요할 때만 `get_project_registries`로 검색 범위를 확인하고 `search_items_in_registries` 또는 `list_items_in_registries`로 후보를 찾는다.
3. `view_items_in_registries`와 `get_item_examples_from_registries`로 API, 의존성, 접근성, 프로젝트 스타일과의 적합성을 검토한다.
4. 실제 도입이 필요한 작업으로 승인된 경우에만 `get_add_command_for_items`로 명령을 얻는다. 실행 전 명령과 예상 변경 파일을 검토하고, 기존 파일의 덮어쓰기 및 의존성 변경 가능성을 확인한다. 후보를 찾았다는 이유만으로 설치하지 않는다.
5. `web/components.json`의 `aliases.ui`는 `src/app/shared/ui/shadcn`을 가리킨다. 도입한 primitive는 이 계층에 두고, 재사용 가능한 공개 API는 `shared/ui/atom` 또는 `shared/ui/molecule`로 감싸고 Storybook 스토리를 작성한다.
6. `get_audit_checklist`로 점검 항목을 확인하고, 관련 스토리·타입 검사·빌드 등 변경 범위에 맞는 검증을 수행한다.

예: “기존 `shared/ui`에 없는 선택 UI가 필요하다. 먼저 Storybook을 확인하고, 부족하면 shadcn MCP로 후보와 예시를 비교해 줘. 설치 전에는 변경 파일을 알려 줘.”

레지스트리 설정과 MCP 연결 방법은 [shadcn/ui 공식 MCP 문서](https://ui.shadcn.com/docs/mcp)를 참고한다. 현재 프로젝트 설정은 `web/components.json`과 워크스페이스의 `.codex/config.toml`, `.mcp.json`에 있다.
