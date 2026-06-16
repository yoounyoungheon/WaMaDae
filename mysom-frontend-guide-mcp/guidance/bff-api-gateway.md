# BFF API Gateway Guide

이 문서는 Next.js App Router의 `app/api/**/route.ts`를 Backend for Frontend 계층으로 사용해 브라우저에서 백엔드 서버 정보를 숨기는 팀 규약이다.

목표는 단순 proxy가 아니다. 브라우저는 항상 같은 origin의 `/api/*`만 호출하고, 실제 백엔드 base URL, 내부 path, 서버 토큰, 응답 shape, 에러 구조는 Next.js 서버 계층에서 흡수한다.

## 언제 읽어야 하나

- `web/src/app/api/**/route.ts`를 생성하거나 수정할 때
- 브라우저에서 백엔드 API를 호출하는 client fetch, axios, hook, service를 만들 때
- `LOCAL_PATH`, `DEPLOY_PATH`, backend base URL, Authorization header, cookie 전달 방식을 다룰 때
- CORS를 피하거나 백엔드 endpoint를 숨기기 위해 `/api/*` 경유 구조를 만들 때

## 핵심 원칙

- 브라우저 코드는 백엔드 origin을 직접 알면 안 된다.
- 브라우저 코드는 `/api/*` 같은 same-origin BFF endpoint만 호출한다.
- 백엔드 base URL은 server-only 환경 변수로만 읽는다.
- `NEXT_PUBLIC_*` 환경 변수에 백엔드 origin, 서버 토큰, 내부 API path를 넣지 않는다.
- Route Handler는 public endpoint이므로 매 요청마다 인증, 인가, 입력 검증을 수행한다.
- BFF는 backend response를 그대로 흘려보내지 말고 필요한 data, status, safe error만 반환한다.

## 기본 흐름

```text
Browser UI / Client Component
-> same-origin /api/*
-> app/api/*/route.ts
-> validate request
-> authenticate and authorize
-> server-only backend fetch
-> normalize response
-> return safe JSON
```

Server Component에서 직접 백엔드 데이터를 조회할 수 있는 경우에도, 브라우저에서 발생하는 API 요청은 `/api/*`를 통한다.

## Route Handler 역할

`app/api/**/route.ts`는 다음 책임을 가진다.

- public HTTP endpoint를 제공한다.
- request method, content-type, body, query param을 검증한다.
- 쿠키나 세션을 읽어 사용자 인증 정보를 확인한다.
- 필요한 경우 백엔드용 Authorization header를 서버에서 조립한다.
- 백엔드 API를 호출한다.
- 백엔드 응답을 safe DTO 또는 view-model에 가까운 형태로 정리한다.
- 민감한 에러 메시지, stack trace, 내부 URL, 내부 header를 제거한다.

Route Handler는 public endpoint라는 점을 잊으면 안 된다. 백엔드 endpoint를 숨기더라도 `/api/*` 자체는 외부에서 호출될 수 있다.

## 환경 변수 규칙

서버 전용 백엔드 base URL 예시:

```env
BACKEND_API_BASE_URL=https://api.internal.example.com
```

금지:

```env
NEXT_PUBLIC_BACKEND_API_BASE_URL=https://api.internal.example.com
```

규칙:

- 브라우저 번들에 들어가도 되는 값만 `NEXT_PUBLIC_*`를 사용한다.
- backend origin과 server token은 server-only 환경 변수로 둔다.
- 백엔드 URL 생성 helper는 Client Component에서 import되지 않게 한다.
- 서버 전용 helper에는 필요하면 `import "server-only"`를 추가한다.

## 권장 파일 구조

```text
web/src/app/
├─ api/
│  └─ wines/
│     └─ route.ts
├─ shared/
│  └─ api/
│     └─ client.ts
└─ utils/
   └─ http/
      └─ server-api.ts
```

브라우저 호출 helper는 Next.js BFF endpoint만 바라본다.

```ts
export async function requestBff(path: string, init?: RequestInit) {
  return fetch(`/api${path}`, {
    credentials: "include",
    ...init,
  });
}
```

서버 전용 백엔드 호출 helper는 Route Handler 또는 Server Component에서만 사용한다.

```ts
import "server-only";

const backendBaseUrl = process.env.BACKEND_API_BASE_URL;

export function buildBackendUrl(path: string) {
  if (!backendBaseUrl) {
    throw new Error("BACKEND_API_BASE_URL is not configured");
  }

  return new URL(path, backendBaseUrl);
}
```

## Route Handler 예시

```ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildBackendUrl } from "@/app/utils/http/server-api";

const SearchParamsSchema = z.object({
  q: z.string().min(1).max(100),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = SearchParamsSchema.safeParse({
    q: url.searchParams.get("q"),
  });

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const backendUrl = buildBackendUrl("/wines/search");
  backendUrl.searchParams.set("q", parsed.data.q);

  const response = await fetch(backendUrl, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Failed to fetch wines" },
      { status: response.status },
    );
  }

  const data = await response.json();

  return NextResponse.json({
    wines: data.items ?? [],
  });
}
```

## Proxy 설계 규칙

가능하면 명시적인 route를 만든다.

권장:

```text
app/api/wines/route.ts
app/api/wines/[id]/route.ts
app/api/orders/route.ts
```

주의해서만 허용:

```text
app/api/[...path]/route.ts
```

catch-all proxy를 만들면 반드시 whitelist를 둔다.

- 허용된 backend path만 forward한다.
- 외부에서 임의 URL을 넘겨 open proxy가 되게 하지 않는다.
- method별 허용 목록을 둔다.
- request header를 그대로 복사하지 않는다.
- backend response header를 그대로 노출하지 않는다.

## Header and Cookie 규칙

- browser request의 `Authorization` header를 무조건 backend로 전달하지 않는다.
- 인증은 가능한 한 httpOnly cookie 또는 서버 세션에서 읽는다.
- backend로 넘길 header는 Route Handler에서 명시적으로 재구성한다.
- `host`, `origin`, `referer`, `cookie`, hop-by-hop header는 그대로 forward하지 않는다.
- backend의 `set-cookie`를 클라이언트로 전달해야 하면 domain, path, secure, sameSite 정책을 명시적으로 검토한다.
- response header에 내부 token, backend URL, infra 정보가 들어가지 않게 한다.

## Validation and Security

- 모든 query, path param, body를 검증한다.
- content-type과 payload size를 확인한다.
- user-generated markup은 sanitize한다.
- 민감 정보가 포함된 값은 URL query에 넣지 않는다. URL은 브라우저 히스토리, 로그, cache에 남을 수 있다.
- 실패 응답은 safe message만 반환한다.
- 백엔드 에러 body를 그대로 노출하지 않는다.
- rate limit은 BFF 또는 hosting layer에서 적용한다.
- backend fetch에는 timeout 또는 abort signal을 둔다.

## Caching

- 사용자별 데이터는 기본적으로 `cache: "no-store"`를 사용한다.
- 공개 데이터만 명시적으로 캐시한다.
- backend Authorization header가 들어가는 요청은 공유 캐시를 피한다.
- cache key에 영향을 주는 header가 있으면 `Vary`를 검토한다.
- mutation 이후에는 관련 route에서 `revalidatePath` 또는 `revalidateTag`를 호출한다.

## Data Flow Layering과의 관계

BFF Route Handler는 data-flow-layering의 서버 경계 중 하나다.

```text
Client UI
-> BFF Route Handler
-> backend service
-> mapper
-> safe DTO
-> JSON response
```

Route Handler 내부가 커지면 다음처럼 나눈다.

```text
app/api/<domain>/route.ts
-> feature/<domain>/business/<domain>.service.ts
-> feature/<domain>/business/<domain>.mapper.ts
-> feature/<domain>/presentation/<domain>.presenter.ts
```

단, Route Handler가 feature UI 타입을 import하지 않게 한다.

## Do

- 브라우저 호출은 `/api/*`로 통일한다.
- backend base URL은 server-only 환경 변수로 숨긴다.
- Route Handler에서 validation, authentication, authorization을 수행한다.
- backend 응답을 safe JSON으로 정리해서 반환한다.
- catch-all proxy보다 명시적인 route를 우선한다.

## Don't

- Client Component에서 backend origin을 직접 fetch하지 않는다.
- `NEXT_PUBLIC_*`에 backend origin이나 token을 넣지 않는다.
- request header와 response header를 통째로 forward하지 않는다.
- 백엔드 에러 body, stack trace, 내부 URL을 그대로 반환하지 않는다.
- 인증/인가 없이 proxy만으로 보호된 리소스 접근을 허용하지 않는다.

## References

- Next.js Backend for Frontend: https://nextjs.org/docs/app/guides/backend-for-frontend
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Next.js Data Security: https://nextjs.org/docs/app/guides/data-security
- Next.js Mutating Data: https://nextjs.org/docs/app/getting-started/mutating-data
