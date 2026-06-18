# Frontend State Management Guide

이 문서는 Next.js 15 환경에서 AI Agent가 TanStack Query와 Zustand를 일관되게 사용하기 위한 개발 가이드다.

## 1. 기본 원칙

이 프로젝트의 상태는 출처와 생명주기에 따라 구분한다.

```text
서버 상태(Server State)
-> TanStack Query

공유 클라이언트 상태(Client/UI State)
-> Zustand

컴포넌트 내부 임시 상태
-> useState

공유하거나 복원해야 하는 URL 상태
-> searchParams
```

### 서버 상태

API를 통해 서버에서 가져오고 서버가 원본을 소유하는 데이터다.

예시:

- 사용자 정보
- 게시글 목록과 상세
- 댓글 목록
- 상품 목록
- 검색 결과
- 알림 목록
- 예약 정보

Client Component에서 사용하는 서버 상태는 TanStack Query로 관리한다. 같은 API 응답을 Zustand나 `useState`에 복제하지 않는다.

Server Component가 초기 데이터를 조회하는 경우에도 서버 데이터의 원본은 서버에 있다. Client Component에서 이어서 조회하거나 갱신해야 한다면 TanStack Query의 prefetch/dehydrate와 hydration 사용을 검토한다.

### 클라이언트 상태

브라우저 안에서만 의미가 있고 여러 컴포넌트가 공유하는 UI 상태다.

예시:

- 모달 열림 여부
- 사이드바 열림 여부
- 선택된 탭
- 여러 컴포넌트가 공유하는 검색 필터
- Toast 메시지
- 드롭다운 상태
- 여러 단계에서 공유하는 임시 입력값
- SSE/WebSocket 연결 상태

공유 클라이언트 상태는 Zustand로 관리한다. 단일 컴포넌트 안에서만 사용하는 짧은 생명주기의 상태는 `useState`를 사용한다.

SSE/WebSocket으로 수신한 서버 데이터 자체를 Zustand에 원본처럼 누적하지 않는다. 연결 여부 같은 UI 상태는 Zustand에 두고, 서버 데이터는 TanStack Query 캐시 갱신 또는 해당 데이터 계층의 정책에 따라 관리한다.

## 2. 사용 금지 원칙

### 서버 데이터를 Zustand에 저장하지 않는다

잘못된 예시:

```ts
const useUserStore = create((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}));
```

API로 가져온 `users`는 Zustand가 아니라 TanStack Query에서 관리한다.

올바른 예시:

```ts
const { data: users } = useUsersQuery();
```

### API 호출 결과를 `useState`에 직접 저장하지 않는다

잘못된 예시:

```tsx
const [users, setUsers] = useState([]);

useEffect(() => {
  fetch("/api/users")
    .then((response) => response.json())
    .then(setUsers);
}, []);
```

올바른 예시:

```tsx
const { data: users, isLoading } = useUsersQuery();
```

## 3. 프로젝트 구조

기본 구조는 Feature-Sliced Design에 가깝게 가져간다. Next.js가 강제하는 공식 디렉터리 구조는 아니며, 프로젝트의 책임 분리를 위한 팀 규약이다.

```text
src/
├─ app/
│  ├─ layout.tsx
│  ├─ providers.tsx
│  └─ page.tsx
│
├─ shared/
│  ├─ api/
│  │  ├─ http.ts
│  │  └─ query-client.ts
│  ├─ config/
│  ├─ lib/
│  ├─ types/
│  └─ ui/
│
├─ entities/
│  └─ user/
│     ├─ api/
│     │  ├─ user.api.ts
│     │  └─ user.query.ts
│     ├─ model/
│     │  └─ user.type.ts
│     └─ ui/
│
├─ features/
│  └─ user-login/
│     ├─ api/
│     ├─ model/
│     │  └─ user-login.store.ts
│     └─ ui/
│
├─ widgets/
│  ├─ header/
│  └─ sidebar/
│
└─ views/
   └─ home/
```

## 4. 디렉터리 역할

### `app`

Next.js App Router 영역이다.

- 라우팅
- layout과 page
- provider 연결
- 화면 진입점과 서버 조합

비즈니스 로직이나 재사용 가능한 상태 로직을 많이 넣지 않는다.

### `shared`

프로젝트 전역에서 재사용되는 코드만 둔다.

예시:

- HTTP client
- QueryClient 설정
- 공통 타입
- 공통 UI
- 공통 유틸리티

특정 도메인이나 사용자 행동에 종속된 코드는 두지 않는다.

### `entities`

도메인 단위의 핵심 데이터와 조회 규칙을 관리한다.

예시:

- user
- post
- book
- product
- order

각 entity는 다음 구조를 기본으로 한다.

```text
entities/user/
├─ api/
│  ├─ user.api.ts
│  └─ user.query.ts
├─ model/
│  └─ user.type.ts
└─ ui/
```

### `features`

사용자 행동 단위의 기능을 관리한다.

예시:

- 로그인
- 회원가입
- 게시글 작성
- 검색
- 좋아요
- 댓글 작성
- 장바구니 담기

기능 전용 mutation과 공유 UI 상태를 둔다. Zustand store는 대부분 feature의 `model` 안에 둔다.

### `widgets`

여러 feature와 entity를 조합한 독립적인 UI 블록이다.

예시:

- Header
- Sidebar
- UserProfileCard
- SearchPanel
- NotificationPanel

### `views`

페이지 단위 화면 조립 영역이다. App Router의 `page.tsx`가 비대해지지 않도록 화면 조립 로직을 분리한다.

## 5. TanStack Query 작성 규칙

### API 함수와 Query Hook을 분리한다

API 함수는 네트워크 요청과 응답 타입을 책임지고, Query Hook은 query key와 캐시 동작을 책임진다.

```ts
// entities/user/api/user.api.ts

import { http } from "@/shared/api/http";
import type { User } from "../model/user.type";

export const getUsers = async (): Promise<User[]> => {
  return http.get("/users");
};

export const getUser = async (userId: string): Promise<User> => {
  return http.get(`/users/${userId}`);
};
```

```ts
// entities/user/api/user.query.ts

import { useQuery } from "@tanstack/react-query";
import { getUser, getUsers } from "./user.api";

export const userQueryKeys = {
  all: ["users"] as const,
  detail: (userId: string) => ["users", "detail", userId] as const,
};

export const useUsersQuery = () => {
  return useQuery({
    queryKey: userQueryKeys.all,
    queryFn: getUsers,
  });
};

export const useUserQuery = (userId: string) => {
  return useQuery({
    queryKey: userQueryKeys.detail(userId),
    queryFn: () => getUser(userId),
    enabled: Boolean(userId),
  });
};
```

Query Hook에서 직접 URL을 조립하거나 네트워크 세부 구현을 반복하지 않는다.

## 6. Query Key 규칙

Query key는 별도 객체에서 관리하고 반드시 배열로 작성한다.

좋은 예시:

```ts
["users"]
["users", "detail", userId]
["posts", "list", { page, keyword }]
["books", "search", { keyword, page }]
```

나쁜 예시:

```ts
"user"
"user-detail"
`user-${userId}`
["post-detail-" + postId]
```

Query key는 도메인에서 세부 범위와 조건으로 좁혀지는 순서로 작성한다.

```ts
export const bookQueryKeys = {
  all: ["books"] as const,
  searches: () => [...bookQueryKeys.all, "search"] as const,
  search: (keyword: string, page: number) =>
    [...bookQueryKeys.searches(), { keyword, page }] as const,
};
```

동일한 데이터를 조회하는 모든 코드가 같은 query key factory를 사용해야 한다.

## 7. Mutation 작성 규칙

등록, 수정, 삭제는 `useMutation`을 사용한다. API 함수와 Mutation Hook도 분리한다.

```ts
// features/create-post/api/create-post.mutation.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postQueryKeys } from "@/entities/post/api/post.query";
import { createPost } from "./create-post.api";

export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postQueryKeys.all,
      });
    },
  });
};
```

Mutation 성공 후에는 영향받은 query를 invalidate한다.

```text
POST /posts
-> 성공
-> ["posts"] 캐시 무효화
-> 활성 게시글 목록 재조회
```

서버 응답만으로 캐시를 완전하고 안전하게 갱신할 수 있을 때는 `setQueryData`를 사용할 수 있다. 불완전한 응답을 기존 캐시에 임의로 합치지 않는다.

Mutation 입력값은 클라이언트와 서버 양쪽 경계에서 검증한다. 인증과 인가는 반드시 서버에서 다시 확인한다.

## 8. Zustand 작성 규칙

Zustand는 여러 컴포넌트가 공유하는 클라이언트 UI 상태에만 사용한다.

```ts
// features/search/model/search-filter.store.ts

import { create } from "zustand";

type SearchFilterState = {
  keyword: string;
  category: string | null;
  setKeyword: (keyword: string) => void;
  setCategory: (category: string | null) => void;
  reset: () => void;
};

export const useSearchFilterStore = create<SearchFilterState>((set) => ({
  keyword: "",
  category: null,

  setKeyword: (keyword) => set({ keyword }),
  setCategory: (category) => set({ category }),

  reset: () =>
    set({
      keyword: "",
      category: null,
    }),
}));
```

컴포넌트에서는 필요한 값이나 action만 selector로 구독한다.

```tsx
const keyword = useSearchFilterStore((state) => state.keyword);
const setKeyword = useSearchFilterStore((state) => state.setKeyword);
```

피해야 할 예시:

```tsx
const store = useSearchFilterStore();
```

전체 store를 구독하면 관련 없는 상태 변경에도 리렌더링될 수 있다.

Store는 도메인별 또는 feature별로 작게 유지한다. 하나의 전역 store에 서로 무관한 상태를 모으지 않는다.

## 9. TanStack Query와 Zustand 조합

검색 화면에서는 다음처럼 역할을 나눈다.

```text
검색어 입력값과 UI 필터
-> Zustand

검색 결과 데이터
-> TanStack Query
```

```tsx
"use client";

import { useBookSearchQuery } from "@/entities/book/api/book.query";
import { useSearchFilterStore } from "../model/search-filter.store";

export function BookSearchResult() {
  const keyword = useSearchFilterStore((state) => state.keyword);
  const { data, isLoading } = useBookSearchQuery(keyword);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {data?.map((book) => (
        <li key={book.id}>{book.title}</li>
      ))}
    </ul>
  );
}
```

검색 조건을 링크로 공유하거나 새로고침 후에도 복원해야 한다면 Zustand보다 URL `searchParams`를 우선한다. URL 값을 query key에 포함해 검색 결과 캐시를 구분한다.

## 10. Provider 설정

QueryClient는 브라우저 생명주기 동안 한 번만 생성한다.

```tsx
// app/providers.tsx

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```tsx
// app/layout.tsx

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

프로젝트 전역 기본값은 `QueryClient` 설정에 두되, 데이터 특성이 다른 query는 각 Query Hook에서 `staleTime`, `gcTime`, refetch 정책을 명시적으로 재정의한다.

## 11. Next.js 15 경계 규칙

### Server Component

- `page.tsx`와 `layout.tsx`는 기본적으로 Server Component다.
- Server Component에서 Zustand hook을 사용하지 않는다.
- 서버 전용 secret, DB client, privileged API 호출은 Client Component로 노출하지 않는다.
- Client Component에 전달하는 props는 직렬화 가능하고 민감 정보가 제거된 데이터여야 한다.

### Client Component

- TanStack Query hook과 Zustand hook을 사용하는 컴포넌트는 Client Component 경계 안에 둔다.
- `"use client"` 범위는 상호작용이 필요한 최소 단위로 제한한다.
- Client Component에서 server-only 모듈을 import하지 않는다.
- 브라우저가 백엔드에 직접 접근하면 안 되는 프로젝트에서는 Route Handler/BFF를 통해 API를 호출한다.

## 12. AI Agent 구현 규칙

AI Agent는 코드를 생성하거나 수정할 때 다음 규칙을 반드시 따른다.

1. Client Component의 API 조회 데이터는 TanStack Query로 관리한다.
2. 여러 컴포넌트가 공유하는 모달, 탭, 필터, 사이드바 등의 UI 상태는 Zustand로 관리한다.
3. 단일 컴포넌트 내부의 임시 상태는 `useState`로 관리한다.
4. 공유하거나 복원해야 하는 검색·필터 조건은 URL `searchParams`를 우선한다.
5. API 함수와 Query Hook을 분리한다.
6. Query key는 별도 객체와 배열로 관리한다.
7. Mutation 성공 후 영향받은 query를 invalidate하거나 완전한 서버 응답으로 안전하게 갱신한다.
8. Zustand store는 필요한 값과 action만 selector로 구독한다.
9. Server Component에서는 Zustand를 사용하지 않는다.
10. TanStack Query 또는 Zustand hook은 Client Component 경계 안에서 사용한다.
11. `useEffect + useState`로 API 데이터를 직접 가져오지 않는다.
12. 서버 데이터의 원본은 서버이며, 클라이언트 캐시는 복사본으로 본다.
13. 서버 데이터를 Zustand와 TanStack Query에 중복 저장하지 않는다.
14. 인증, 인가, 입력값 검증은 서버에서 다시 수행한다.

## 13. AI Agent가 피해야 할 코드

### API 데이터를 `useState`에 저장

```tsx
const [posts, setPosts] = useState([]);

useEffect(() => {
  getPosts().then(setPosts);
}, []);
```

금지한다.

### API 데이터를 Zustand에 저장

```ts
const usePostStore = create((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
}));
```

금지한다.

### Query key를 문자열 조합으로 관리

```ts
queryKey: ["post-detail-" + postId];
```

금지한다.

### Store 전체 구독

```tsx
const store = useModalStore();
```

피한다.

### Server Component에서 Zustand 사용

```tsx
export default function Page() {
  const isOpen = useModalStore((state) => state.isOpen);
  return <div>{isOpen ? "open" : "closed"}</div>;
}
```

금지한다. Zustand가 필요한 부분만 별도 Client Component로 분리한다.

## 14. 권장 판단 기준

새로운 상태가 필요할 때 다음 순서로 판단한다.

```text
이 데이터의 원본이 API 또는 서버에 있는가?
-> TanStack Query

이 상태가 URL로 공유되거나 새로고침 후 복원되어야 하는가?
-> searchParams

이 상태가 여러 Client Component의 UI 동작에 필요한가?
-> Zustand

이 상태가 특정 컴포넌트 내부에서만 필요한가?
-> useState

이 값은 props로 자연스럽게 전달할 수 있는가?
-> 불필요한 전역 상태를 만들지 않고 props 사용
```

상태 도구를 선택하기 전에 상태를 실제로 저장해야 하는지도 확인한다. 기존 props나 다른 상태에서 계산할 수 있는 값은 별도 상태로 중복 저장하지 않는다.

## 15. 최종 요약

```text
TanStack Query
= 서버 상태 캐시 계층

Zustand
= 공유 클라이언트 UI 상태 계층

useState
= 컴포넌트 내부 임시 상태

URL searchParams
= 공유·복원 가능한 필터와 검색 조건
```

AI Agent는 데이터의 출처, 공유 범위, 생명주기, URL 복원 필요성을 먼저 판단한 뒤 상태 관리 방식을 선택해야 한다.
