# Data Flow Layering Guide

이 문서는 `web` 프론트엔드에서 API 응답, DB 조회 결과, route handler 응답이 UI까지 전달되는 동안 어떤 레이어를 거쳐야 하는지 정리한 팀 규약이다.

Next.js 15 App Router가 강제하는 공식 디렉터리 표준은 아니다. Next.js는 프로젝트 파일 배치에 비교적 비의견적이며, 이 문서는 그 위에서 사용하는 Data Access Layer, DTO, presenter/view-model 중심의 팀 아키텍처 규칙이다.

## 목적

- 외부 응답 계약과 UI props를 직접 연결하지 않는다.
- 서버 전용 데이터 접근, 화면 조합, UI 렌더링 책임을 분리한다.
- Client Component로 전달되는 데이터는 안전하고 최소한의 DTO/view-model로 제한한다.
- Next.js 15의 Server Component, Server Action, fetch cache, revalidation 규칙을 명시적으로 고려한다.

## 기본 흐름

읽기 데이터의 권장 흐름은 아래와 같다.

```text
External API / DB / Route Handler
-> data access layer or business service
-> api-model or external DTO
-> mapper
-> domain or internal DTO
-> presenter
-> safe view-model
-> Server Component composition
-> UI component
```

핵심은 **서버 전용 레이어가 권한과 외부 shape를 흡수하고, UI에는 렌더링에 필요한 최소 데이터만 넘긴다**는 점이다.

작은 화면이나 프로토타입에서는 일부 단계를 합칠 수 있다. 다만 외부 응답 shape, 권한 검사, 민감 정보 필터링, UI props 변환 책임이 한 컴포넌트에 섞이기 시작하면 레이어를 분리한다.

## Next.js 15 기준

### Server Component

- `page.tsx`, `layout.tsx`는 기본적으로 Server Component다.
- Server Component에서는 `fetch`, ORM, DB client, server-only helper를 사용할 수 있다.
- Server Component는 데이터를 조회하고 초기 렌더링을 조합할 수 있다.
- Client Component로 넘기는 props는 React가 직렬화할 수 있어야 하며, 민감 정보가 포함되면 안 된다.

### Client Component

- Client Component는 브라우저에서 실행된다는 보안 가정으로 다룬다.
- Client Component는 privileged API key, DB client, server-only module, raw private domain object를 직접 알면 안 된다.
- 상호작용이 필요한 경우에도 서버 데이터는 safe view-model이나 Server Action을 통해 전달한다.

### Data Access Layer

새 기능에서는 전용 Data Access Layer 또는 business service를 둔다.

이 레이어는 다음 책임을 가진다.

- 서버에서만 실행된다.
- 인증과 인가를 검사한다.
- 외부 API, DB, route handler 응답을 조회한다.
- 외부 응답 shape를 내부에서 사용할 타입으로 정리한다.
- Client Component로 전달해도 안전한 최소 DTO를 만들 수 있는 기반 데이터를 제공한다.

서버 전용 파일에는 필요하면 `import "server-only"`를 추가해 Client Component import를 조기에 차단한다.

## 레이어별 책임

### 1. `api-model` or external DTO

- 외부 API, route handler, DB query 결과의 raw shape를 표현한다.
- nullable, snake_case, 불안정한 외부 필드를 여기서 받아낸다.
- UI에서 직접 import 하거나 props로 사용하지 않는다.

### 2. `mapper`

- 외부 응답 구조를 내부 표현으로 변환한다.
- 필드명, nullable, 기본값, 단위, enum 차이를 흡수한다.
- 외부 계약 변경의 영향을 이 레이어에 최대한 가둔다.

### 3. `domain` or internal DTO

- feature 내부에서 의미 있는 데이터 구조다.
- 모든 화면 props와 1:1로 같을 필요는 없다.
- 민감 정보가 포함될 수 있다면 Client Component로 직접 넘기지 않는다.

### 4. `business service` or DAL function

- 서버에서 데이터를 조회한다.
- 인증/인가와 응답 상태를 검사한다.
- mapper를 호출한다.
- 기본적으로 domain 또는 내부 DTO까지만 반환한다.
- UI props를 직접 만들기 시작하면 presenter와 책임이 섞인다.

### 5. `presenter`

- domain/internal DTO를 화면 친화적인 safe view-model로 변환한다.
- UI가 필요한 필드만 추린다.
- 라벨, 경로, 카드 목록, 표시용 상태, 빈 상태 문구처럼 화면 요구사항에 가까운 값을 만든다.
- `page.tsx`, `layout.tsx`, 또는 서버 조합 컴포넌트에서 호출한다.

### 6. `view-model`

- 특정 UI가 바로 렌더링할 수 있는 safe props shape다.
- Client Component에 전달되어도 되는 최소 데이터여야 한다.
- domain과 같을 수는 있지만, 같아야 하는 것은 아니다.

### 7. `UI`

- 가능한 한 view-model만 props로 받는다.
- Server Component UI는 필요한 경우 직접 server-only 조회를 할 수 있지만, shared/domain UI는 raw API shape에 의존하지 않는다.
- Client Component UI는 server-only 데이터 접근을 하지 않는다.

## Mutations

쓰기 작업은 Server Action, Server Function, Route Handler 중 하나로 명확히 둔다.

Server Action/Function 권장 흐름:

```text
form or client event
-> Server Action
-> validate input
-> authenticate and authorize
-> mutate through DAL/service
-> revalidatePath or revalidateTag
-> redirect or return safe result
```

규칙:

- Server Action 안에서도 인증과 인가를 다시 확인한다.
- client input은 신뢰하지 않고 zod 같은 schema로 검증한다.
- mutation 후 화면 갱신이 필요하면 `revalidatePath`, `revalidateTag`, `updateTag`, `refresh`, `redirect` 중 의도에 맞는 API를 사용한다.
- Client Component에서 Server Function을 호출할 수는 있지만, DB/API secret을 직접 다루는 모듈을 import하지 않는다.

## Caching and Revalidation

Next.js 15에서는 `fetch` 요청과 `GET` Route Handler가 기본적으로 캐시되지 않는다.

규칙:

- 캐시가 필요하면 `fetch(url, { cache: "force-cache" })`, `next: { revalidate }`, route segment config, cache directive를 명시한다.
- 항상 최신 데이터가 필요하면 기본 uncached 동작을 사용하거나 `cache: "no-store"`를 명시한다.
- mutation 이후 stale UI가 생기면 `revalidatePath` 또는 `revalidateTag`를 호출한다.
- 캐시 정책은 service/DAL 근처에 둬야 데이터 신선도 책임이 흩어지지 않는다.
- page/layout에서 임시로 fetch 옵션을 덮어쓰기보다, 데이터 접근 함수의 계약으로 cache behavior를 드러낸다.

## 권장 디렉터리 구조

Next.js가 강제하는 구조는 아니며, feature 규모가 커질 때 사용하는 권장 구조다.

```text
src/
├─ app/
│  ├─ page.tsx
│  ├─ layout.tsx
│  └─ ...
├─ features/
│  └─ <domain>/
│     ├─ business/
│     │  ├─ <domain>.api-model.ts
│     │  ├─ <domain>.domain.ts
│     │  ├─ <domain>.mapper.ts
│     │  └─ <domain>.service.ts
│     ├─ presentation/
│     │  ├─ <domain>.view-model.ts
│     │  └─ <domain>.presenter.ts
│     └─ ui/
│        └─ ...
└─ shared/
   └─ ...
```

`app` 안에 feature 파일을 colocate할 수도 있다. 이 경우 라우트로 오해되지 않도록 private folder(`_features`, `_lib`)나 route group을 사용한다. `page.tsx` 또는 `route.ts`가 없는 폴더는 public route가 되지 않지만, private folder를 쓰면 의도가 더 명확하다.

## 반드시 지켜야 할 규칙

- Client Component에 raw API response, private domain object, DB row 전체를 넘기지 않는다. (MUST)
- 서버 전용 데이터 접근 파일은 Client Component에서 import되지 않게 한다. (MUST)
- 인증/인가가 필요한 데이터는 DAL/service 또는 Server Action 안에서 검사한다. (MUST)
- UI용 view-model은 presenter나 안전한 DTO 생성 함수에서 만든다. (SHOULD)
- page/layout은 Server Component 조합 레이어로 두고, 필요한 데이터를 서버에서 준비한다. (SHOULD)
- 캐시와 재검증 정책은 데이터 접근 함수 근처에 명시한다. (SHOULD)

## 안티 패턴

- Client Component가 raw API 응답 shape를 props로 받는 경우
- service가 `CardProps[]`, `ButtonProps[]` 같은 UI component props를 바로 반환하는 경우
- business/DAL 레이어가 `feature/*/ui/*` 타입을 import하는 경우
- `page.tsx`에서 DB row나 private domain object를 그대로 Client Component에 넘기는 경우
- mutation 후 cache revalidation 없이 stale UI를 방치하는 경우
- cache 정책이 page, service, route handler에 흩어져 같은 데이터의 신선도 기준이 달라지는 경우

## 빠른 판단 질문

- 이 타입은 외부 응답 계약인가? -> `api-model` or external DTO
- 이 로직은 인증/인가 또는 데이터 접근인가? -> DAL/service
- 이 로직은 외부 shape를 내부 의미로 바꾸는가? -> mapper
- 이 타입은 feature 내부 의미인가? -> domain/internal DTO
- 이 값은 Client Component에 넘겨도 안전한가? -> safe view-model
- 이 로직은 쓰기 작업인가? -> Server Action/Function or Route Handler
- 이 데이터는 캐시되어도 되는가? -> cache/revalidation policy

## Do

- API 계약 변경은 mapper나 DAL에서 흡수한다.
- UI 요구사항 변경은 presenter/view-model에서 흡수한다.
- Client Component props는 최소화한다.
- 서버 전용 데이터 접근 파일에는 `server-only` 사용을 검토한다.
- mutation에는 validation, authorization, revalidation을 함께 둔다.

## Don't

- service에서 UI component props를 바로 만들지 않는다.
- Client Component에서 server-only 모듈이나 secret이 필요한 fetch를 import하지 않는다.
- api-model, domain, view-model을 같은 타입으로 취급하지 않는다.
- Next.js가 이 디렉터리 구조를 공식 표준으로 강제한다고 설명하지 않는다.

## References

- Next.js Project Structure: https://nextjs.org/docs/app/getting-started/project-structure
- Next.js Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js Fetching Data: https://nextjs.org/docs/app/getting-started/fetching-data
- Next.js Data Security: https://nextjs.org/docs/app/guides/data-security
- Next.js Mutating Data: https://nextjs.org/docs/app/getting-started/mutating-data
- Next.js 15 Upgrade Guide: https://nextjs.org/docs/app/guides/upgrading/version-15
