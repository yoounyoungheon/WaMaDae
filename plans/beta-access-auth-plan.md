# 베타 사용자 접근 인증 구현 계획

## 1. 목표와 범위

정식 회원·권한 시스템을 도입하지 않고, 공유된 베타 접근 코드를 아는 사용자만 웹 애플리케이션과 중요 BFF API에 접근할 수 있게 한다.

```text
/beta에서 접근 코드 입력
→ POST /api/beta-auth
→ 서버 환경 변수와 코드 비교
→ 7일 만료 JWT 생성
→ beta_access HttpOnly Cookie 저장
→ /
→ middleware와 중요 Route Handler에서 JWT 검증
```

이번 범위에 포함하지 않는 항목:

- 회원 계정, 사용자별 식별자, 역할 및 권한
- 비밀번호 재설정, 소셜 로그인, 세션 DB
- Auth.js/NextAuth 같은 전체 인증 프레임워크
- 베타 코드 관리용 관리자 화면
- 분산 rate limit 저장소

## 2. 현재 프로젝트 확인 결과

- Next.js `15.5.19`, React `19.2.7`, App Router, TypeScript를 사용한다.
- 패키지 매니저는 npm이며 `web/package-lock.json`이 있다.
- 기존 `middleware.ts`, `proxy.ts`, 인증 유틸 및 로그인 기능은 없다.
- Next.js 15이므로 `proxy.ts`가 아니라 `web/src/middleware.ts`를 사용한다.
- 현재 공개 Route Handler:
  - `GET /api/health`
  - `POST /api/wine-pairings/extract-wine-menu`
  - `POST /api/wine-pairings/recommend-menu`
  - `POST /api/wine-pairings/pairing`
  - `POST /api/wine-pairings/chat`
- 공통 UI는 `TextInput`, `Button`, `LoadingSpinner`, `Card`를 재사용할 수 있다.
- `page.tsx`는 Server Component로 유지하고 폼 상호작용만 Client Component로 분리한다.
- `.env`와 `.env*.local`은 `web/.gitignore`에서 제외된다. `.env.example`은 추적 가능한 예시 파일이다.

## 3. 기술 결정

### JWT

- `jose`를 런타임 의존성으로 추가한다.
- 이유:
  - `SignJWT`, `jwtVerify`로 생성과 검증을 한 라이브러리에서 처리할 수 있다.
  - Web Crypto 기반의 Web-interoperable runtime을 지원해 Next.js Middleware의 Edge Runtime과 호환된다.
  - 별도 하위 의존성이 없는 ESM 패키지다.
- 알고리즘은 공유 비밀키 기반 `HS256`을 사용한다.
- payload는 `{ type: "beta" }`만 포함하고 `iat`, `exp`를 설정한다.
- 검증 시 서명, `exp`, 허용 알고리즘, `type === "beta"`를 모두 확인한다.
- 토큰 검증 실패 이유는 외부 응답에 구분해서 노출하지 않는다.

### Cookie

```text
name: beta_access
httpOnly: true
secure: process.env.NODE_ENV === "production"
sameSite: lax
path: /
maxAge: 60 * 60 * 24 * 7
```

- JWT는 JSON 응답, URL, localStorage, sessionStorage에 포함하지 않는다.
- 인증 성공 응답은 `{ ok: true }` 정도의 최소 정보만 반환한다.

### 환경 변수

`web/.env.example`에는 값 없이 다음 키만 추가한다.

```env
BETA_ACCESS_CODE=
BETA_JWT_SECRET=
```

- 실제 값은 `web/.env.local` 또는 배포 환경의 secret으로 설정한다.
- 두 값 모두 `NEXT_PUBLIC_` 접두사를 사용하지 않는다.
- secret은 최소 32바이트 이상의 무작위 문자열 사용을 문서화한다.
- 환경 변수 누락 또는 지나치게 짧은 secret은 서버 설정 오류로 처리한다.
- 서버 로그에는 누락된 key 이름만 기록하고 실제 code/secret/token은 기록하지 않는다.

## 4. 예정 파일 구조

```text
web/
├─ src/
│  ├─ app/
│  │  ├─ beta/
│  │  │  └─ page.tsx
│  │  ├─ api/
│  │  │  ├─ beta-auth/
│  │  │  │  └─ route.ts
│  │  │  └─ wine-pairings/**/route.ts
│  │  └─ feature/
│  │     └─ beta-access/
│  │        └─ ui/
│  │           ├─ BetaAccessForm.tsx
│  │           └─ BetaAccessForm.stories.tsx
│  ├─ lib/
│  │  └─ auth/
│  │     ├─ beta-token.ts
│  │     ├─ beta-token.test.ts
│  │     └─ beta-request.ts
│  └─ middleware.ts
├─ .env.example
├─ package.json
└─ package-lock.json

docs/
└─ beta-access.md
```

기존 디렉터리는 이동하지 않는다. `src/lib/auth`는 UI 기능이 아니라 Middleware와 Route Handler가 함께 사용하는 서버 경계 유틸이므로 별도 공통 위치로 둔다.

## 5. `/beta` 페이지

### Server/Client 경계

- `app/beta/page.tsx`는 Server Component로 유지하며 metadata와 페이지 shell만 담당한다.
- `BetaAccessForm.tsx`만 `"use client"`로 만들고 입력값, loading, error 상태를 로컬 `useState`로 관리한다.
- TanStack Query나 Zustand는 추가하지 않는다. 단발성 인증 요청과 폼 내부 상태에는 과도하다.

### UI와 동작

- 기존 `Card`, `TextInput`, `Button`, `LoadingSpinner`를 재사용한다.
- password 타입 또는 접근 코드에 적합한 마스킹 입력을 사용한다.
- `<form>` submit으로 `POST /api/beta-auth`를 호출한다.
- 요청 중 입력과 버튼을 비활성화하고 버튼에 loading 상태를 표시한다.
- `401`이면 `유효하지 않은 접근 코드입니다.`를 입력과 연결된 오류 메시지로 표시한다.
- `500`이면 내부 원인을 숨기고 일반적인 서버 오류 문구를 표시한다.
- 성공하면 `router.replace("/")` 후 `router.refresh()`로 이동해 Cookie가 적용된 서버 경계를 다시 평가한다.
- 응답 body에서 token을 읽거나 보관하지 않는다.
- 이미 유효한 Cookie가 있는 `/beta` 요청은 Middleware가 `/`로 redirect한다.

## 6. `POST /api/beta-auth`

처리 순서:

1. `Content-Type: application/json`을 확인한다.
2. body를 안전하게 파싱하고 zod로 `{ code: string }` 형식, 공백 여부 및 최대 길이를 검증한다.
3. `BETA_ACCESS_CODE`, `BETA_JWT_SECRET` 설정을 확인한다.
4. 설정 누락 시 실제 값을 출력하지 않고 서버 로그를 남긴 뒤 `500`과 일반 메시지를 반환한다.
5. 코드가 일치하지 않으면 `401`과 `유효하지 않은 접근 코드입니다.`를 반환한다.
6. 일치하면 `createBetaToken()`으로 7일 JWT를 발급한다.
7. `NextResponse.cookies.set()`으로 `beta_access` Cookie를 저장한다.
8. `{ ok: true }`를 반환하고 JWT는 body에 포함하지 않는다.

잘못된 요청 형식은 `400`, 코드 불일치는 `401`, 서버 설정 오류는 `500`으로 구분한다. 성공 및 인증 실패 응답에는 `Cache-Control: no-store`를 적용한다.

## 7. JWT 및 요청 인증 유틸

### `beta-token.ts`

```ts
createBetaToken(): Promise<string>
verifyBetaToken(token: string): Promise<boolean>
```

- 환경 변수 접근과 secret encoding을 한 곳에 둔다.
- 생성 시 `HS256`, `type: "beta"`, `iat`, `exp: 7d`를 설정한다.
- 검증 시 `algorithms: ["HS256"]`와 만료 검증을 적용한다.
- `verifyBetaToken`은 만료·변조·잘못된 payload를 모두 `false`로 정규화하되 설정 오류는 서버 로그로 구분할 수 있게 설계한다.

### `beta-request.ts`

- `beta_access` Cookie 추출과 `verifyBetaToken` 호출을 묶은 공통 함수를 제공한다.
- Middleware와 중요 Route Handler가 같은 Cookie 이름과 검증 규칙을 사용하게 한다.
- 인증 실패 응답에는 구체적인 JWT 오류를 포함하지 않는다.

## 8. Middleware 보호 정책

`web/src/middleware.ts`가 정적 자산을 제외한 요청 전에 Cookie를 검증한다.

### 공개 경로

- `/beta`
- `/api/beta-auth`
- `/api/health` — 배포 환경의 liveness/readiness probe를 위해 공개 유지
- `/_next/static/*`
- `/_next/image/*`
- `/favicon.ico`, `/robots.txt`, `/sitemap.xml`
- `public/`에서 제공되는 이미지·폰트 등 확장자를 가진 정적 파일

### 동작

```text
/beta + 유효 Cookie      → /
/beta + Cookie 없음/오류 → 통과
보호 페이지 + 유효 Cookie → 통과
보호 페이지 + Cookie 오류 → /beta redirect
보호 API + 유효 Cookie   → 통과
보호 API + Cookie 오류   → 401 JSON
```

- 페이지와 API 실패 응답을 구분해 API 호출자가 HTML redirect를 성공 응답처럼 처리하지 않게 한다.
- matcher는 정적 파일을 가능한 한 실행 대상에서 제외하고, 함수 내부에서도 공개 경로를 명시적으로 확인한다.
- `/beta`와 `/api/beta-auth` 예외를 먼저 처리해 redirect loop를 방지한다.
- 원래 경로를 query string으로 전달하는 기능은 이번 범위에서 추가하지 않는다. 인증 성공 후 항상 `/`로 이동한다.

## 9. 중요 BFF API의 이중 검증

Middleware 설정만으로 보안 경계를 완성됐다고 간주하지 않는다. 현재 사용자 데이터 흐름을 실행하는 아래 4개 Route Handler를 중요 API로 본다.

- `/api/wine-pairings/extract-wine-menu`
- `/api/wine-pairings/recommend-menu`
- `/api/wine-pairings/pairing`
- `/api/wine-pairings/chat`

각 Route Handler 시작 지점에서 공통 request 인증 helper를 호출하고, 실패하면 backend를 호출하기 전에 safe `401` JSON을 반환한다. 기존 body 검증, SSE streaming, backend error mapping은 변경하지 않는다.

의도적으로 공개 유지하는 API:

- `/api/beta-auth`
- `/api/health`

## 10. 테스트 계획

### 단위 테스트

`beta-token.test.ts`에서 다음을 검증한다.

- 정상 token 생성 및 검증
- `type !== "beta"` payload 거부
- 서명 변조 token 거부
- 만료 token 거부
- 다른 secret으로 서명한 token 거부
- 환경 변수 누락 또는 짧은 secret 처리

Route Handler와 Middleware 테스트를 추가해 다음을 확인한다.

- 올바른 code는 `200`, `Set-Cookie`, HttpOnly, SameSite=Lax, Path=/, 7일 max-age를 반환한다.
- 응답 body에는 token이 없다.
- 잘못된 code는 `401`이고 `Set-Cookie`가 없다.
- 환경 변수 누락은 `500`이며 secret을 응답하지 않는다.
- `/beta`, `/api/beta-auth`, `/api/health`, 정적 파일은 Cookie 없이 통과한다.
- 보호 페이지의 없음·변조·만료 Cookie는 `/beta`로 redirect된다.
- 보호 API의 없음·변조·만료 Cookie는 `401`이 된다.
- 유효 Cookie로 `/beta` 접근 시 `/`로 redirect된다.

### Storybook

`BetaAccessForm.stories.tsx`에 모바일 폭 기준으로 다음 상태를 둔다.

- `Default`
- `Submitting`
- `InvalidCode`
- `ServerError`

네트워크 mock은 story 범위에서만 사용하며 실제 접근 코드나 token fixture를 노출하지 않는다.

### 실제 실행 검증

테스트용 환경 변수를 프로세스에만 주입해 새 dev 서버를 시작하고 다음을 확인한다.

1. Cookie 없이 `/` → `/beta`
2. Cookie 없이 `/beta` → `200`
3. 잘못된 code → `401`, Cookie 없음
4. 정상 code → HttpOnly Cookie 발급, `/` 접근 성공
5. Cookie 삭제 후 `/` → `/beta`
6. Cookie 임의 변조 후 `/` → `/beta`
7. 만료 token으로 `/` → `/beta`
8. `/api/beta-auth`는 Cookie 없이 호출 가능
9. `/_next/*`와 `public/` 정적 이미지가 Cookie 없이 로드됨
10. `/api/health`는 Cookie 없이 `200`
11. Cookie 없는 와인 BFF API는 `401`이며 backend 요청을 시작하지 않음
12. Playwright Chromium에서 입력, 오류, 성공 redirect 흐름 확인

마지막으로 다음을 실행한다.

```text
npm run test:unit
npx tsc --noEmit
npm run build
npm run build-storybook
```

검증 후 프론트엔드 프로세스를 새 환경 변수와 코드 기준으로 재시작한다.

## 11. 구현 순서

1. `jose`를 설치하고 `.env.example`에 빈 key를 추가한다.
2. JWT 생성·검증 유틸과 단위 테스트를 작성한다.
3. request Cookie 검증 helper를 작성한다.
4. `/api/beta-auth`와 Route Handler 테스트를 구현한다.
5. `/beta` Server page와 Client form, Storybook을 구현한다.
6. `src/middleware.ts`와 공개 경로 matcher를 구현한다.
7. 와인 BFF 4개에 route-level 인증 검증을 연결한다.
8. `docs/beta-access.md`에 환경 변수, 배포 설정, 보호/공개 경로를 문서화한다.
9. 단위·타입·빌드·Storybook 검증을 수행한다.
10. dev 서버를 재시작하고 curl 및 Playwright Chromium으로 전체 시나리오를 확인한다.

## 12. 완료 기준

- 접근 코드와 JWT secret이 클라이언트 번들 및 응답에 포함되지 않는다.
- JWT는 `beta_access` HttpOnly Cookie에만 저장된다.
- 정상 인증 없이 보호 페이지와 중요 와인 BFF를 사용할 수 없다.
- 만료·변조 token은 정상 token으로 처리되지 않는다.
- `/beta`, `/api/beta-auth`, `/api/health`, Next.js 및 public 정적 자산에는 인증이 필요 없다.
- 유효 Cookie 사용자가 `/beta`에 접근하면 `/`로 이동한다.
- 기존 SSE 및 와인 추천 흐름은 유효 Cookie 상태에서 회귀 없이 동작한다.
- `.env`와 `.env.local`은 Git에 포함되지 않고 `.env.example`에는 실제 값이 없다.
- 단위 테스트, TypeScript, Next.js build, Storybook build 및 Playwright 시나리오가 통과한다.

## 참고 자료

- [Next.js 15 Middleware](https://nextjs.org/docs/15/app/api-reference/file-conventions/middleware)
- [NextResponse Cookie API](https://nextjs.org/docs/app/api-reference/functions/next-response)
- [Next.js cookies](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [jose](https://github.com/panva/jose)
