# RSC Guide

`AGENTS.md` 또는 `Calude.md`의 Server Component 정책만 분리한 문서다. 이 문서는 React Server Component를 언제, 어떻게 사용해야 하는지 빠르게 판단하는 기준으로 사용한다.

## 목적

- 기본 컴포넌트 작성 방식은 Server Component로 둔다.
- 데이터 조회와 초기 렌더링 책임은 서버에 둔다.
- 클라이언트 상호작용은 필요한 범위에서만 별도 Client Component로 분리한다.

## 기본 원칙

- 모든 컴포넌트는 기본적으로 Server Component로 작성한다.
- React hook, 브라우저 API, 사용자 이벤트 처리가 없으면 Server Component를 우선 사용한다.
- 데이터 렌더링은 서버에서 처리한다.

## Server Component를 사용해야 하는 경우

- 서버에서 데이터를 조회하는 경우
- 페이지 초기 데이터를 렌더링하는 경우
- 정적인 UI를 출력하는 경우
- SEO가 중요한 화면인 경우
- 브라우저 API가 필요 없는 경우
- 사용자 이벤트 처리가 없는 경우

## 반드시 Server Component로 유지해야 하는 파일

- `page.tsx`
- `layout.tsx`

## 페이지와 레이아웃 규칙

- `page.tsx`, `layout.tsx`는 인터랙션이 있어도 파일 자체는 Server Component로 유지한다.
- 상호작용이 필요하면 인터랙션 영역만 별도 Client Component로 분리해 하위에 배치한다.
- 페이지 전체에 `"use client"`를 선언해서 문제를 해결하는 방식은 지양한다.

예시:

```tsx
Page (Server)
├ ContentSection (Server)
└ LikeButton (Client)
```

## Composition 규칙

- 권장 구조는 `Server Component -> Client Component` 패턴이다.
- Server Component는 데이터 조회와 초기 렌더링을 담당한다.
- Client Component는 사용자 인터랙션을 담당한다.

## Import 규칙

- Server Component는 Client Component를 import 할 수 있다.
- Client Component가 필요로 하는 서버 렌더링 결과는 `children` 또는 props로 전달하는 패턴을 사용할 수 있다.

## 데이터 조회 규칙

- 초기 데이터 조회는 Server Component에서 수행한다.
- 서버 전용 로직은 서버에 둔다.
- DB 접근, 인증 처리 같은 서버 전용 로직은 Client Component로 내리지 않는다.

## 빠른 판단 체크리스트

아래 질문이 모두 "아니오"이면 Server Component를 기본값으로 사용한다.

- React hook이 필요한가
- 사용자 이벤트 처리가 필요한가
- 브라우저 API가 필요한가

## Do

- 서버에서 필요한 데이터를 먼저 조회한다.
- 가능한 한 정적인 구조와 초기 콘텐츠를 서버에서 렌더링한다.
- 상호작용이 필요한 부분만 작은 Client Component로 분리한다.

## Don't

- 단순 UI 출력만 하는 컴포넌트를 습관적으로 Client Component로 만들지 않는다.
- `page.tsx`, `layout.tsx`에 `"use client"`를 붙이지 않는다.
- 초기 데이터 fetch를 Client Component로 밀어 넣지 않는다.
