# Mysom Frontend Guidance MCP

`web` 프론트엔드 작업 전에 참고해야 할 가이드를 추천하고, 선택한 가이드 markdown 본문을 반환하는 MCP 서버입니다.

## 실행

의존성을 설치한 뒤 빌드합니다.

```bash
npm install
npm run build
```

빌드된 MCP 서버는 stdio transport로 실행합니다.

```bash
npm run start
```

개발 중에는 TypeScript 소스를 watch 모드로 실행할 수 있습니다.

```bash
npm run dev
```

MCP 클라이언트에 등록할 때는 이 프로젝트를 working directory로 두고 `node dist/index.js`를 실행하면 됩니다.

```json
{
  "command": "node",
  "args": ["dist/index.js"],
  "cwd": "/Users/yun-yeongheon/dev/WaMaDae/mysom-frontend-guide-mcp"
}
```

## Codex에 등록

Codex CLI와 Codex IDE extension은 같은 MCP 설정을 공유합니다. 사용자 전체에 적용하려면 `~/.codex/config.toml`에, 이 저장소에서만 쓰려면 신뢰한 프로젝트의 `.codex/config.toml`에 추가합니다.

```toml
[mcp_servers.mysom-frontend-guidance-mcp]
command = "node"
args = ["dist/index.js"]
cwd = "/Users/yun-yeongheon/dev/WaMaDae/mysom-frontend-guide-mcp"
startup_timeout_sec = 10
tool_timeout_sec = 60
enabled = true
```

Codex CLI에서 직접 추가할 수도 있습니다. 이 방식은 `cwd`를 따로 적지 않으므로 `dist/index.js`의 절대 경로를 사용합니다.

```bash
codex mcp add mysom-frontend-guidance-mcp -- node /Users/yun-yeongheon/dev/WaMaDae/mysom-frontend-guide-mcp/dist/index.js
```

등록 후 새 Codex 세션을 시작하거나 기존 세션을 재시작합니다. Codex TUI에서는 `/mcp`로 서버 연결 상태와 노출된 도구를 확인할 수 있습니다.

## Claude에 등록

### Claude Code

Claude Code에서는 local stdio MCP 서버로 추가합니다.

```bash
claude mcp add --transport stdio mysom-frontend-guidance-mcp -- \
  node /Users/yun-yeongheon/dev/WaMaDae/mysom-frontend-guide-mcp/dist/index.js
```

현재 프로젝트에서만 쓰는 기본 local scope 대신 팀 공유용 `.mcp.json`을 만들려면 `--scope project`를 붙입니다.

```bash
claude mcp add --transport stdio --scope project mysom-frontend-guidance-mcp -- \
  node /Users/yun-yeongheon/dev/WaMaDae/mysom-frontend-guide-mcp/dist/index.js
```

상태 확인:

```bash
claude mcp list
claude mcp get mysom-frontend-guidance-mcp
```

Claude Code 세션 안에서는 `/mcp`로 연결 상태를 확인합니다. project scope로 추가한 서버는 보안상 최초 사용 전에 Claude Code에서 승인해야 할 수 있습니다.

### Claude Desktop

Claude Desktop은 설정 화면에서 MCP config 파일을 열어 등록합니다.

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

설정 예시:

```json
{
  "mcpServers": {
    "mysom-frontend-guidance-mcp": {
      "command": "node",
      "args": [
        "/Users/yun-yeongheon/dev/WaMaDae/mysom-frontend-guide-mcp/dist/index.js"
      ]
    }
  }
}
```

파일을 저장한 뒤 Claude Desktop을 완전히 종료하고 다시 실행합니다. 연결이 안 보이면 Claude Desktop MCP 로그를 확인합니다.

- macOS: `~/Library/Logs/Claude`
- Windows: `%APPDATA%\Claude\logs`

macOS에서 최근 MCP 로그를 확인하는 예:

```bash
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
```

## 제공 도구

### `resolve_guides`

작업 설명과 수정 대상 경로를 받아 지금 읽어야 할 가이드를 우선순위와 함께 반환합니다.

입력:

```json
{
  "task": "page.tsx에서 service와 presenter 데이터 흐름 변경",
  "targetPaths": ["web/src/app/page.tsx"]
}
```

출력은 MCP `text` content 안에 JSON 문자열로 들어갑니다.

```json
{
  "guides": [
    {
      "id": "data-flow-layering",
      "reason": "matched target path: web/src/app/page.tsx; matched task keywords for data-flow-layering",
      "priority": "high"
    }
  ],
  "availableGuideIds": ["data-flow-layering"]
}
```

우선순위는 경로 매칭, 키워드 매칭, story 파일 여부를 점수화해 계산합니다.

### `read_guide`

선택한 guide id의 markdown 본문과 source 파일 상태를 반환합니다.

입력:

```json
{
  "id": "rsc-rendering"
}
```

주요 출력 필드:

- `body`: `guidance/*.md`에서 읽은 실제 가이드 본문
- `sourcePaths`: 가이드가 근거로 삼는 source 경로
- `sources`: 각 source의 존재 여부와 마지막 수정 시간
- `canonicalSourcePaths`: 최신성 판단 기준 source 경로
- `lastUpdated`: canonical source 중 가장 최근 수정 시간

## 가이드 데이터

가이드 목록은 [guidance/guidances.json](./guidance/guidances.json)에서 관리합니다.

형식:

```ts
{
  guidances: GuideDefinition[];
}
```

`GuideDefinition` 구조:

```ts
{
  id: string;
  title: string;
  summary: string;
  triggers: {
    paths: string[];
    keywords: string[];
  };
  sources: string[];
  canonicalSources: string[];
  guideFiles: string[];
}
```

현재 등록된 guide id:

- `data-flow-layering`
- `bff-api-gateway`
- `rsc-rendering`
- `rcc-rendering`
- `css-only-state`
- `storybook-authoring`
- `style-implementation`

## 경로 규칙

`guidances.json`의 경로는 두 기준으로 해석됩니다.

- `guidance/*.md`: 이 MCP 프로젝트 루트 기준
- `web/*` 등 그 외 상대 경로: 워크스페이스 루트 기준
- 절대 경로: 그대로 사용

예시:

```json
{
  "sources": ["guidance/RSC-guide.md"],
  "canonicalSources": ["guidance/RSC-guide.md"],
  "guideFiles": ["guidance/RSC-guide.md"]
}
```

`triggers.paths`는 작업 대상 파일 경로와 매칭되는 glob 패턴입니다. 절대 경로가 들어오면 워크스페이스 루트 기준 상대 경로로 정규화한 뒤 매칭합니다.

## 가이드 추가 절차

1. `guidance/<guide-name>.md`에 markdown 가이드를 작성합니다.
2. `guidance/guidances.json`의 `guidances` 배열에 새 항목을 추가합니다.
3. `id`는 고유해야 합니다.
4. `guideFiles`에는 반환할 markdown 파일 경로를 넣습니다.
5. `triggers.paths`와 `triggers.keywords`를 작업 상황에 맞게 추가합니다.
6. `npm run build`로 타입 빌드를 확인합니다.
7. MCP 서버를 재시작합니다.

## 검증

빌드:

```bash
npm run build
```

간단한 로컬 확인:

```bash
node -e "import('./dist/guides.js').then((m) => console.log(m.listGuideIds()))"
```

`guidances.json`은 서버 시작 시 로드됩니다. 파일을 수정한 뒤에는 실행 중인 MCP 서버를 재시작해야 변경사항이 반영됩니다.
