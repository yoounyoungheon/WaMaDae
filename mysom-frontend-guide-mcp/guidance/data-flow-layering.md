# Frontend State Management Guide

이 문서는 Next.js 15 환경에서 AI Agent가 TanStack Query와 Zustand를 일관되게 사용하기 위한 개발 가이드다.

## 1. 기본 원칙

이 프로젝트의 상태는 출처와 생명주기에 따라 구분한다.

```text
초기 렌더링용 서버 데이터
-> Server Component

Client Component의 서버 상태 캐시
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

초기 렌더링에 필요한 서버 데이터는 Server Component에서 우선 조회한다. Client Component에서 상호작용 이후 다시 조회하거나 캐싱해야 하는 서버 상태는 TanStack Query로 관리한다. 같은 API 응답을 Zustand나 `useState`에 복제하지 않는다.

Server Component가 조회한 데이터를 Client Component에서 이어서 사용해야 한다면 TanStack Query의 prefetch/dehydrate와 hydration을 사용해 동일한 query key의 캐시를 전달한다. 서버 조회 직후 클라이언트에서 같은 데이터를 다시 요청하는 구조를 만들지 않는다.

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

로그인 여부, 현재 사용자 권한, Feature Flag처럼 대부분의 화면에서 UI 분기 조건으로 반복 사용하는 파생 상태는 예외적으로 Zustand에 둘 수 있다. 이 경우에도 사용자 API 응답 전체를 복제하지 않고 필요한 값만 저장한다.

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

다만 인증 사용자 정보 중 전역 UI 분기에 필요한 파생 상태는 예외다.

```ts
type AuthState = {
  isAuthenticated: boolean;
  role: UserRole | null;
};
```

로그인 여부, 현재 사용자 권한, Feature Flag, 전역 layout에서 반복적으로 사용하는 최소 사용자 정보는 Zustand 사용을 허용한다. 대부분의 화면에서 참조되고 UI 분기 조건으로 사용되는 값이어야 하며, 서버 데이터 전체를 저장하는 용도로 확장하지 않는다.

동일한 서버 데이터를 TanStack Query와 Zustand에 동시에 저장하고 동기화하는 코드는 금지한다.

```ts
const useAuthStore = create(() => ({
  user: null,
}));
```

```tsx
const { data: user } = useMeQuery();

useEffect(() => {
  setUser(user);
}, [user]);
```

인증 상태가 서버 응답에서 파생된다면 필요한 최소 값만 명시적인 인증 흐름에서 갱신하고, Query 결과 전체를 effect로 복제하지 않는다.

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
│     │  └─ user.api.ts
│     ├─ model/
│     │  └─ user.type.ts
│     └─ ui/
│
├─ features/
│  ├─ view-users/
│  │  └─ api/
│  │     └─ use-users-query.ts
│  ├─ create-user/
│  │  └─ api/
│  │     └─ use-create-user-mutation.ts
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

도메인 단위의 핵심 데이터를 표현한다.

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
│  └─ user.api.ts
├─ model/
│  └─ user.type.ts
└─ ui/
```

Entity에는 타입, API 함수, 도메인 모델, 사용자 행동을 포함하지 않는 순수 UI를 둔다. 생성, 수정, 삭제, 로그인 같은 비즈니스 액션이나 화면 use case에 종속된 Query Hook을 계속 추가하지 않는다.

### `features`

사용자 행동이나 화면 use case 단위의 기능을 관리한다.

예시:

- 로그인
- 회원가입
- 게시글 작성
- 검색
- 좋아요
- 댓글 작성
- 장바구니 담기

Query Hook, Mutation Hook, Zustand store, 사용자 액션처럼 특정 use case를 수행하는 코드를 둔다. Zustand store는 대부분 feature의 `model` 안에 둔다.

```text
features/
├─ create-user/
├─ update-user/
├─ delete-user/
└─ login/
```

판단 기준은 단순하다.

```text
데이터 정의
-> Entity

사용자 행동 또는 화면 use case
-> Feature
```

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

API 함수는 Entity에서 네트워크 요청과 응답 타입을 책임진다. Query Hook은 해당 조회 use case의 Feature에서 query key와 캐시 정책만 담당한다.

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
// features/view-users/api/use-users-query.ts

import { useQuery } from "@tanstack/react-query";
import {
  getUser,
  getUsers,
} from "@/entities/user/api/user.api";

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

### Query Hook은 캐시 정책만 담당한다

Query Hook의 책임은 다음으로 제한한다.

- `queryKey`
- `queryFn`
- `staleTime`
- `enabled`
- `retry`
- `select`를 사용한 가벼운 데이터 변환

필터링, 정렬, 도메인 계산, 모델 변환처럼 의미 있는 비즈니스 로직은 Query Hook 내부에 작성하지 않는다.

잘못된 예시:

```ts
export const useBooksQuery = () => {
  return useQuery({
    queryFn: async () => {
      const books = await getBooks();

      return books
        .filter((book) => book.rating > 4)
        .sort((a, b) => b.rating - a.rating)
        .map(convertBook);
    },
  });
};
```

권장 예시:

```ts
export const useBooksQuery = () => {
  return useQuery({
    queryKey: bookQueryKeys.all,
    queryFn: getBooks,
  });
};
```

```ts
export const selectPopularBooks = (books: Book[]): Book[] => {
  return books
    .filter((book) => book.rating > 4)
    .sort((a, b) => b.rating - a.rating);
};
```

비즈니스 로직은 별도 순수 함수로 분리해 독립적으로 테스트하고 필요한 계층에서 조합한다.

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

동일한 데이터를 조회하는 모든 코드가 같은 query key factory를 사용해야 한다. Hydration이나 다른 Feature의 Mutation에서도 key가 필요하다면 조회 Feature의 별도 파일로 분리해 재사용하고, key만 사용하기 위해 Client Hook 모듈 전체를 import하지 않는다.

## 7. Mutation 작성 규칙

등록, 수정, 삭제는 `useMutation`을 사용한다. API 함수와 Mutation Hook도 분리한다.

```ts
// features/create-post/api/use-create-post-mutation.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/entities/post/api/post.api";
import { postQueryKeys } from "@/features/view-posts/api/post-query-keys";

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

게시글 생성처럼 목록 전체에 영향을 주고 서버가 정렬이나 집계 결과를 계산하는 작업은 영향받은 query를 invalidate한다.

```text
POST /posts
-> 성공
-> ["posts"] 캐시 무효화
-> 활성 게시글 목록 재조회
```

Mutation 성공 시 무조건 `invalidateQueries`를 사용하지 않는다. 서버 응답만으로 현재 캐시를 완전하고 안전하게 갱신할 수 있다면 `setQueryData`를 우선 검토한다.

좋아요, 북마크, 읽음 처리, 단건 수정처럼 변경 대상과 결과가 명확한 작업이 대표적이다.

```ts
queryClient.setQueryData(
  postQueryKeys.detail(postId),
  updatedPost,
);
```

목록 전체가 영향을 받거나 서버 계산 결과를 반영해야 하는 경우, 변경 범위가 불명확한 경우, 관련 query가 많은 경우에는 `invalidateQueries`를 사용한다. 불완전한 응답을 기존 캐시에 임의로 합치지 않는다.

```text
서버 응답만으로 캐시를 완전하게 갱신할 수 있음
-> setQueryData

재조회가 더 안전함
-> invalidateQueries
```

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

import { useBookSearchQuery } from "@/features/search-books/api/use-book-search-query";
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
- 초기 렌더링에만 필요한 데이터는 Server Component에서 우선 조회한다.
- Server Component에서 Zustand hook을 사용하지 않는다.
- 서버 전용 secret, DB client, privileged API 호출은 Client Component로 노출하지 않는다.
- Client Component에 전달하는 props는 직렬화 가능하고 민감 정보가 제거된 데이터여야 한다.

초기 데이터 조회를 위해 페이지 전체를 무조건 Client Component로 만들지 않는다.

잘못된 예시:

```tsx
"use client";

export default function BookPage() {
  const { data } = useBooksQuery();

  return <BookList books={data} />;
}
```

권장 예시:

```tsx
// app/books/page.tsx

import { getBooks } from "@/entities/book/api/book.api";

export default async function BookPage() {
  const books = await getBooks();

  return <BookList books={books} />;
}
```

다음 요구가 있다면 Client Component와 TanStack Query 사용을 우선 검토한다.

- 사용자 인터랙션 이후 데이터 변경
- 페이지네이션
- 무한 스크롤
- 실시간 데이터 갱신
- 백그라운드 재조회
- 클라이언트 캐싱

### Client Component

- TanStack Query hook과 Zustand hook을 사용하는 컴포넌트는 Client Component 경계 안에 둔다.
- `"use client"` 범위는 상호작용이 필요한 최소 단위로 제한한다.
- Client Component에서 server-only 모듈을 import하지 않는다.
- 브라우저가 백엔드에 직접 접근하면 안 되는 프로젝트에서는 Route Handler/BFF를 통해 API를 호출한다.

### Server Component와 Query Hydration

Server Component에서 조회한 데이터를 Client Component가 동일한 Query Hook으로 이어서 사용할 때는 hydration을 적용한다.

```tsx
// app/books/page.tsx

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getBooks } from "@/entities/book/api/book.api";
import { bookQueryKeys } from "@/features/view-books/api/book-query-keys";

export default async function BookPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: bookQueryKeys.all,
    queryFn: getBooks,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientPage />
    </HydrationBoundary>
  );
}
```

Client Component의 Query Hook은 prefetch에 사용한 것과 동일한 query key를 사용한다.

```tsx
"use client";

export function ClientPage() {
  const { data } = useBooksQuery();

  return <BookList books={data} />;
}
```

초기 데이터가 props로만 필요하면 직접 전달하고, 클라이언트 캐시와 후속 조회가 필요할 때 hydration을 사용한다.

```text
Server Component 조회
-> Client Component에서 동일 데이터 즉시 재조회
```

위와 같은 중복 요청 구조는 만들지 않는다.

## 12. AI Agent 구현 규칙

AI Agent는 코드를 생성하거나 수정할 때 다음 규칙을 반드시 따른다.

1. 초기 렌더링에 필요한 데이터는 Server Component 조회를 우선 검토한다.
2. 초기 데이터 조회만을 위해 페이지 전체를 Client Component로 만들지 않는다.
3. Client Component에서 상호작용, 재조회, 캐싱이 필요한 서버 데이터는 TanStack Query로 관리한다.
4. Server Component에서 prefetch한 query를 Client Component가 이어서 사용하면 동일한 query key로 hydration한다.
5. 여러 컴포넌트가 공유하는 모달, 탭, 필터, 사이드바 등의 UI 상태는 Zustand로 관리한다.
6. 인증 사용자 정보는 전역 UI 분기에 필요한 최소 파생 상태만 Zustand 사용을 허용한다.
7. 단일 컴포넌트 내부의 임시 상태는 `useState`로 관리한다.
8. 공유하거나 복원해야 하는 검색·필터 조건은 URL `searchParams`를 우선한다.
9. API 함수는 Entity에, Query Hook과 Mutation Hook은 해당 use case의 Feature에 둔다.
10. Query Hook은 캐시 정책만 담당하고 비즈니스 로직은 별도 함수로 분리한다.
11. Query key는 별도 객체와 배열로 관리한다.
12. Mutation 성공 후 서버 응답만으로 캐시를 완전히 갱신할 수 있으면 `setQueryData`를 우선 검토하고, 재조회가 더 안전하면 invalidate한다.
13. Zustand store는 필요한 값과 action만 selector로 구독한다.
14. Server Component에서는 Zustand를 사용하지 않는다.
15. TanStack Query 또는 Zustand hook은 Client Component 경계 안에서 사용한다.
16. `useEffect + useState`로 API 데이터를 직접 가져오지 않는다.
17. 서버 데이터의 원본은 서버이며, 클라이언트 캐시는 복사본으로 본다.
18. 서버 데이터를 Zustand와 TanStack Query에 중복 저장하거나 effect로 동기화하지 않는다.
19. 인증, 인가, 입력값 검증은 서버에서 다시 수행한다.

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
-> 초기 렌더링에만 필요하면 Server Component에서 조회
-> Client Component의 후속 조회·갱신·캐시가 필요하면 TanStack Query
-> 서버 조회 결과를 클라이언트 query가 이어서 쓰면 hydration

이 상태가 URL로 공유되거나 새로고침 후 복원되어야 하는가?
-> searchParams

인증·권한·Feature Flag처럼 전역 UI 분기에 반복 사용하는 최소 파생 상태인가?
-> 예외적으로 Zustand

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
Server Component
= 초기 렌더링용 서버 데이터 조회 계층

TanStack Query
= Client Component의 서버 상태 캐시 계층

Zustand
= 공유 클라이언트 UI 상태와 최소 인증 파생 상태 계층

useState
= 컴포넌트 내부 임시 상태

URL searchParams
= 공유·복원 가능한 필터와 검색 조건
```

AI Agent는 데이터의 출처, 렌더링 시점, 공유 범위, 생명주기, URL 복원 필요성을 먼저 판단한 뒤 조회 위치와 상태 관리 방식을 선택해야 한다.
