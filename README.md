# 마이솜 (Mysom)

마이솜은 음식과의 페어링을 통해 오늘 마실 와인을 쉽게 고를 수 있도록 돕는 서비스입니다. 

## 저장소 구성

| 경로 | 역할 |
| --- | --- |
| [`web/`](./web/README.md) | Next.js App Router 기반 웹 애플리케이션과 BFF |
| [`mysom-frontend-guide-mcp/`](./mysom-frontend-guide-mcp/README.md) | 작업에 맞는 개발 가이드를 추천하고 본문을 반환하는 MCP 서버 |
| [`api/`](./api/mysom-api.md) | 현재 백엔드 API 계약, 서버 버전별 차이, 로컬 연결 방법 |
| `designs/` | 화면 디자인 원본 |
| `plans/` | 페이지별 구현 계획 |
| `docs/` | 페이지별 구현 내용과 데이터 흐름 문서 |

이 프로젝트의 AI Native 작업 방식은 Agent가 저장소의 문서와 개발 가이드를 읽고 구현에 활용하는 흐름입니다.

1. **규칙과 가이드 확인**: `web/AGENTS.md`와 `web/CLAUDE.md`는 공통 작업 규칙인 `web/GUIDE.md`를 참조합니다. Agent는 이 규칙에 따라 `mysom-frontend-guide-mcp/`의 MCP 서버를 통해 작업에 필요한 세부 가이드를 읽습니다.
2. **요구사항 분석과 계획**: `designs/`의 화면 디자인과 `api/`의 API 명세를 분석해 `plans/`에 페이지별 구현 계획을 작성합니다.
3. **구현과 검증**: 계획과 가이드를 바탕으로 `web/`에서 기능을 구현하고 검증합니다.
4. **구현 기록**: 결과와 주요 결정 사항을 `docs/`에 정리해 다음 작업에서도 같은 맥락을 이어갈 수 있도록 합니다.

웹은 TypeScript, React, Tailwind CSS를 사용하며, 서버 상태는 TanStack Query, 클라이언트 상태는 Zustand, 응답 검증은 Zod로 처리합니다. 공통 UI는 Storybook에서 확인할 수 있습니다.

## 웹 실행

Node.js와 npm을 준비하고, 저장소 루트에서 웹 의존성을 설치합니다.

```bash
cd web
npm install
cp .env.example .env.local
```

`.env.local`에 다음 값을 설정합니다.

| 환경변수 | 설정 |
| --- | --- |
| `MYSOM_API_BASE_URL` | BFF가 호출할 백엔드 주소. 로컬에서는 `http://localhost:8080` |
| `NEXT_PUBLIC_WINE_EXCLUDE_CATALOG` | `false`이면 카탈로그 매칭 결과를 포함. 미설정 또는 다른 값이면 매칭 항목 제외 |
| `BETA_ACCESS_CODE` | 웹 베타 접근에 사용할 코드 |
| `BETA_JWT_SECRET` | 베타 인증 토큰 서명에 사용할 최소 32바이트 비밀값 |

베타 인증 값은 직접 지정해야 합니다. 구체적인 설정 항목은 [`web/.env.example`](./web/.env.example)을 참고하세요. `NEXT_PUBLIC_WINE_EXCLUDE_CATALOG`를 변경하면 개발 서버를 재시작하거나 다시 빌드해야 합니다.

별도 API 서버를 실행한 뒤 웹 개발 서버를 시작합니다. 현재 기준 서버는 `feature/wine-sample`이며, 실행 방법은 [API 명세의 로컬 실행](./api/mysom-api.md#로컬-실행)에 정리되어 있습니다.

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에 접속합니다. 웹은 같은 오리진의 BFF를 통해 API 서버에 요청하며, 사진 추출부터 채팅까지 동일한 UUID `X-Session-Id`를 유지합니다.

`web/`에서 사용할 수 있는 주요 명령은 다음과 같습니다.

| 명령 | 용도 |
| --- | --- |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드된 웹 실행 |
| `npm run lint` | 코드 린트 |
| `npm run test:unit` | 단위 테스트 |
| `npm run storybook` | Storybook 개발 서버 (`http://localhost:6006`) |
| `npm run build-storybook` | Storybook 정적 빌드 |

## 개발 가이드 MCP

저장소 루트에서 MCP 서버 의존성을 설치하고 빌드합니다.

```bash
cd mysom-frontend-guide-mcp
npm install
npm run build
```

빌드된 서버는 `npm run start`로 stdio transport를 통해 실행합니다. 개발 시에는 `npm run dev`로 TypeScript 소스를 watch 모드에서 실행할 수 있습니다.

MCP 클라이언트에는 이 디렉터리를 working directory로 지정해 `node dist/index.js`를 실행하거나, 빌드 파일의 절대 경로를 등록합니다. 클라이언트별 등록 방법은 [MCP 서버 README](./mysom-frontend-guide-mcp/README.md)에 정리되어 있습니다. 문서의 예시 절대 경로는 실제 저장소 위치에 맞게 변경하세요.

서버는 두 도구를 제공합니다.

- `resolve_guides`: 작업 설명과 대상 경로를 받아 필요한 가이드를 우선순위와 함께 추천합니다.
- `read_guide`: 선택한 가이드의 Markdown 본문과 근거 파일 상태를 반환합니다.

가이드는 데이터 흐름, BFF, RSC/RCC 경계, CSS 상태 표현, 공통 UI, Storybook, 스타일 구현을 다룹니다. 목록과 매칭 규칙은 [`guidances.json`](./mysom-frontend-guide-mcp/guidance/guidances.json)에서 관리합니다.

## 개발 전 참고 문서

프론트엔드 작업 전에 [`web/AGENTS.md`](./web/AGENTS.md)와 [`web/GUIDE.md`](./web/GUIDE.md)를 읽고, MCP로 작업에 적용되는 가이드를 확인합니다. 화면 구현은 `designs/`와 API 명세를 참고해 `plans/`에 페이지별 계획을 작성하고, 구현 후 `docs/`에 정리합니다.

- [공통 API 계약과 로컬 연결](./api/mysom-api.md)
- [와인 메뉴 이미지 추출](./api/mysom-ocr.md)
- [메뉴 추천·페어링·채팅](./api/mysom-wine-pairing.md)
