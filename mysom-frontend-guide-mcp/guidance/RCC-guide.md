# RCC Guide

`AGENTS.md` 또는 `Calude.md`의 Client Component 정책만 분리한 문서다. 이 문서는 React Client Component를 언제 분리해야 하는지, 어느 범위까지 허용해야 하는지 판단하는 기준으로 사용한다.

## 목적

- Client Component는 클라이언트 상호작용이 필요한 경우에만 사용한다.
- `"use client"` 사용 범위를 최소화한다.
- 인터랙션을 위해 필요한 최소 단위만 클라이언트로 분리한다.

## 기본 원칙

- Client Component는 기본값이 아니라 예외적인 선택이다.
- Client Component 파일 상단에는 반드시 `"use client"`를 선언한다.
- 상태 관리, 이벤트 처리, 브라우저 API 접근이 필요한 경우에만 사용한다.

## Client Component로 분리해야 하는지 먼저 검토할 경우

- `useState`, `useReducer` 등 상태 관리가 필요한 경우
- `useEffect`, `useRef` 등 클라이언트 실행 이후 동작이 필요한 경우
- `onClick`, `onChange`, `onSubmit` 등 이벤트 처리가 필요한 경우
- `window`, `document`, `localStorage` 등 브라우저 API가 필요한 경우
- 모달, 드롭다운, 탭, 폼 입력 등 인터랙션 UI인 경우

## 분리 원칙

- Client Component는 필요한 범위에서 최소 단위로 분리한다.
- 페이지 전체를 Client로 바꾸지 말고, 상호작용 영역만 작은 컴포넌트로 떼어낸다.
- 서버가 담당해야 할 초기 렌더링과 데이터 조회 책임은 유지한다.

## `"use client"` 규칙

- `"use client"`는 필요한 파일에만 선언한다.
- 선언 이유가 불명확한 넓은 범위의 Client 전환은 지양한다.
- 상호작용이 필요한 부분만 별도 Client Component로 분리한다.

## Composition 규칙

- 권장 구조는 `Server Component -> Client Component`다.
- Client Component는 사용자 인터랙션을 담당한다.
- Server Component가 상위에서 데이터를 준비하고, Client Component는 상호작용만 처리한다.

## Import 규칙

- Client Component는 `server-only` 모듈, 서버 전용 데이터 조회 함수, Server Component 모듈을 직접 import 해 클라이언트 번들에 끌어오지 않는다.
- 서버 렌더링 결과가 필요하면 상위 Server Component가 렌더링한 결과를 `children` 또는 props로 전달받는 interleaving 구조를 사용한다.

잘못된 예:

```tsx
Client Component ("use client")
└ import Server Component 또는 server-only module
```

권장 예:

```tsx
Server Component
└ Client Component
  └ children 또는 props로 전달된 server-rendered result
```

## 데이터와 로직 규칙

- Client Component에서 초기 데이터 fetch를 수행하는 방식은 지양한다.
- 서버 전용 로직은 Client Component에 포함하지 않는다.
- DB 접근, 인증 처리 같은 로직은 반드시 서버에 둔다.

## 빠른 판단 체크리스트

아래 질문 중 하나라도 "예"이면 Client Component 분리를 우선 검토한다.

- React hook이 필요한가
- 사용자 이벤트 처리가 필요한가
- 브라우저 API가 필요한가

## Do

- 이벤트 처리와 상태 관리가 필요한 UI만 Client Component로 만든다.
- 모달, 탭, 드롭다운, 폼 같은 상호작용 영역을 독립적으로 분리한다.
- 가능한 한 작은 범위에만 `"use client"`를 적용한다.

## Don't

- 단순 초기 렌더링 컴포넌트를 Client Component로 만들지 않는다.
- 페이지 전체에 `"use client"`를 선언하지 않는다.
- Server Component를 직접 import 하지 않는다.
- 서버 전용 로직을 Client Component 안에 두지 않는다.
