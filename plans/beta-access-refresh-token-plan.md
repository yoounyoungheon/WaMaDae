# 베타 접근 인증 Access/Refresh Token 전환 설계

## 1. 목적

현재 베타 접근 인증은 `beta_access` JWT 하나를 7일 동안 사용한다. 구현은 단순하지만 토큰이 탈취되면 최대 7일 동안 보호 페이지와 API에 접근할 수 있다.

이를 다음과 같이 변경한다.

```text
Access Token  : 15분
Refresh Token : 7일
```

- 짧은 Access Token으로 직접적인 사용 가능 시간을 줄인다.
- Refresh Token이 유효한 동안 Middleware가 Access Token을 자동으로 재발급한다.
- 사용자는 최초 코드 입력 후 최대 7일 동안 갱신 과정을 인지하지 않고 서비스를 이용한다.
- 회원, 세션 DB, Redis, Auth.js 및 별도 refresh API는 추가하지 않는다.

이번 설계는 공유 코드 기반의 베타 게이트에 맞춘 최소한의 stateless 인증이다. 사용자별 세션 관리나 완전한 Refresh Token 폐기 기능을 제공하는 정식 로그인 시스템은 아니다.

## 2. 현재 구조

```text
POST /api/beta-auth
→ BETA_ACCESS_CODE 검증
→ type=beta, 7일 만료 JWT 발급
→ beta_access HttpOnly Cookie 저장

보호 요청
→ Middleware에서 beta_access 검증
→ 중요 와인 BFF Route Handler에서 beta_access 재검증
```

현재 환경 변수는 그대로 유지한다.

```env
BETA_ACCESS_CODE=
BETA_JWT_SECRET=
```

새 secret이나 데이터 저장소는 추가하지 않는다. Access Token과 Refresh Token은 동일한 `BETA_JWT_SECRET`으로 서명하되 서로 다른 `type`과 `audience`를 사용해 상호 대체할 수 없게 한다.

## 3. 목표 흐름

### 최초 인증

```text
/beta에서 코드 입력
→ POST /api/beta-auth
→ 코드 검증
→ Access Token + Refresh Token 발급
→ 두 토큰을 각각 HttpOnly Cookie로 저장
→ /
```

### 일반 요청

```text
페이지/API 요청
→ Access Token 정상
→ 요청 통과
```

### Access Token 만료 또는 누락

```text
페이지/API 요청
→ Access Token 없음·만료·변조
→ Refresh Token 검증
   ├─ 정상: 새 Access Token 발급 후 현재 요청 통과
   └─ 실패: 페이지는 /beta redirect, API는 401
```

Middleware 갱신은 사용자가 별도 API를 호출하거나 화면을 새로 고칠 필요 없이 이루어진다.

## 4. Token과 Cookie 규격

### Access Token

```text
cookie name : beta_access
payload     : { type: "beta-access" }
audience    : beta-access
expires     : 15분
maxAge      : 15분
httpOnly    : true
secure      : production에서 true
sameSite    : lax
path        : /
```

### Refresh Token

```text
cookie name : beta_refresh
payload     : { type: "beta-refresh" }
audience    : beta-refresh
expires     : 7일
maxAge      : 7일
httpOnly    : true
secure      : production에서 true
sameSite    : lax
path        : /
```

Refresh Token도 Middleware가 모든 보호 요청에서 읽어야 하므로 `path: /`를 사용한다. 두 토큰은 응답 body, URL, localStorage 또는 sessionStorage에 포함하지 않는다.

검증 시 다음 항목을 모두 확인한다.

- 서명 알고리즘 `HS256`
- issuer `mysom-web`
- token별 audience
- `iat`, `exp`
- token별 `type`

Access Token을 Refresh Token 자리에 사용하거나 그 반대로 사용하는 요청은 거부한다.

## 5. 최소 구현 방식

### JWT 유틸

`web/src/lib/auth/beta-token.ts`를 다음 책임으로 확장한다.

```ts
createBetaAccessToken(): Promise<string>
createBetaRefreshToken(): Promise<string>
verifyBetaAccessToken(token: string): Promise<boolean>
verifyBetaRefreshToken(token: string): Promise<boolean>
```

공통 서명·검증 로직은 내부 함수로 묶고, 외부 함수에서 token 종류와 만료 시간을 고정한다. 기존 `createBetaToken`, `verifyBetaToken` 이름은 모호하므로 Access/Refresh가 드러나는 이름으로 교체한다.

Cookie 이름과 만료 시간도 같은 파일에서 상수로 관리한다.

```ts
BETA_ACCESS_COOKIE_NAME = "beta_access"
BETA_REFRESH_COOKIE_NAME = "beta_refresh"
BETA_ACCESS_MAX_AGE_SECONDS = 60 * 15
BETA_REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
```

### 최초 인증 Route Handler

`POST /api/beta-auth`는 코드 검증 성공 시 두 토큰을 생성하고 두 Cookie를 함께 설정한다.

```text
beta_access  → 15분
beta_refresh → 7일
```

두 토큰 중 하나라도 생성하지 못하면 성공 응답을 반환하지 않는다. 오류 응답에는 token이나 내부 검증 사유를 포함하지 않는다.

별도의 `/api/beta-auth/refresh` Route Handler는 만들지 않는다. Middleware가 갱신을 담당하는 편이 현재 규모에서 클라이언트 retry 처리와 추가 공개 API를 피할 수 있어 더 단순하다.

## 6. Middleware 설계

Middleware는 공개 경로를 제외한 요청을 다음 순서로 처리한다.

1. `beta_access`를 검증한다.
2. 유효하면 현재 요청을 통과시킨다.
3. 없거나 유효하지 않으면 `beta_refresh`를 검증한다.
4. Refresh Token이 유효하면 새 Access Token을 생성한다.
5. 새 Access Token을 응답의 `Set-Cookie`에 설정한다.
6. 새 Access Token이 현재 요청의 보호 Route Handler에서도 보이도록 내부 전달용 `Cookie` request header도 갱신한다.
7. Refresh Token도 유효하지 않으면 인증 실패로 처리하고 남아 있는 인증 Cookie를 제거한다.

### 같은 요청에 새 Access Token 전달

응답 Cookie만 설정하면 브라우저는 다음 요청부터 새 토큰을 보낸다. 현재 요청의 와인 BFF Route Handler는 기존의 만료된 Cookie를 보게 되므로 자체 검증에서 `401`을 반환한다.

이를 방지하기 위해 Middleware가 downstream request header를 복제하고 `beta_access` 값을 새 토큰으로 교체한 뒤 `NextResponse.next({ request: { headers } })`로 전달한다. 동시에 브라우저를 위한 응답 Cookie도 설정한다.

```text
Middleware
├─ response Set-Cookie: 새 beta_access
└─ downstream request Cookie: 새 beta_access
                         ↓
                 Route Handler 재검증 성공
```

이 동작은 페이지와 API 요청 모두에 동일하게 적용한다.

### `/beta` 접근

- Access Token이 유효하면 `/`로 redirect한다.
- Access Token은 만료됐지만 Refresh Token이 유효하면 Access Token을 재발급하고 `/`로 redirect한다.
- 둘 다 유효하지 않으면 `/beta` 접근을 허용한다.

### 인증 실패

- 보호 페이지: `/beta`로 redirect
- 보호 API: `401` JSON
- 실패 응답에서 `beta_access`, `beta_refresh` Cookie를 모두 만료시켜 불필요한 재검증을 줄인다.

기존 공개 경로 정책은 유지한다.

- `/beta`
- `/api/beta-auth`
- `/api/health`
- Next.js 정적 리소스와 public 정적 파일

## 7. 중요 BFF의 이중 검증

아래 Route Handler의 기존 Access Token 재검증을 유지한다.

- `/api/wine-pairings/extract-wine-menu`
- `/api/wine-pairings/recommend-menu`
- `/api/wine-pairings/pairing`
- `/api/wine-pairings/chat`

Route Handler는 Refresh Token으로 직접 인증을 허용하지 않는다. Middleware가 Refresh Token 검증과 Access Token 재발급을 완료한 뒤, 갱신된 Access Token을 현재 request header에 전달해야 한다.

이렇게 하면 역할이 분리된다.

```text
Middleware    : Refresh Token 검증과 Access Token 갱신
Route Handler : Access Token만 재검증
```

## 8. Refresh Token 회전 정책

이번 범위에서는 Refresh Token을 사용할 때마다 교체하지 않는다.

- Access Token만 필요할 때마다 새로 발급한다.
- Refresh Token은 최초 코드 인증 시 발급한 뒤 7일 동안 고정한다.
- 7일이 지나면 사용자는 `/beta`에서 코드를 다시 입력한다.

매 요청 회전은 동시 API 요청에서 여러 Refresh Token이 동시에 발급되는 경쟁 조건을 만들 수 있다. 탈취 token 재사용을 확실히 탐지하려면 이전 token 식별자를 저장할 DB 또는 Redis가 필요하므로, stateless로 유지하는 이번 목표와 맞지 않는다.

## 9. 로그아웃

자동 갱신을 도입하면 `beta_access`만 삭제해서는 Refresh Token이 즉시 새 Access Token을 발급한다. 따라서 향후 로그아웃 UI를 추가할 때는 반드시 두 Cookie를 함께 삭제해야 한다.

```text
beta_access  → maxAge=0
beta_refresh → maxAge=0
```

이번 작업에는 로그아웃 UI를 필수 범위로 포함하지 않는다. 다만 Cookie 제거 helper는 Middleware의 인증 실패 처리와 향후 로그아웃에서 재사용할 수 있게 분리한다.

## 10. 보안 특성과 한계

개선되는 점:

- Access Token 탈취 시 직접 사용할 수 있는 최대 시간이 7일에서 15분으로 줄어든다.
- Refresh Token은 HttpOnly Cookie라 클라이언트 JavaScript에서 읽을 수 없다.
- 서로 다른 `type`과 `audience`로 두 token의 용도 혼용을 막는다.

남는 한계:

- Refresh Token을 탈취한 공격자는 만료 전까지 새 Access Token을 받을 수 있다.
- 서버 저장소가 없으므로 특정 사용자나 기기의 Refresh Token만 강제로 폐기할 수 없다.
- `BETA_JWT_SECRET`을 변경하면 전체 Refresh Token과 Access Token이 함께 무효화된다.
- 공유 접근 코드 방식이므로 사용자 식별, 권한, 감사 로그를 제공하지 않는다.

베타 코드가 노출되면 `BETA_ACCESS_CODE`를 변경하고, 기존 접속까지 모두 종료해야 하면 `BETA_JWT_SECRET`도 변경한다.

## 11. 파일 변경 계획

```text
web/src/lib/auth/beta-token.ts
  - Access/Refresh 생성·검증 함수와 상수

web/src/lib/auth/beta-request.ts
  - Access Token request 검증 유지
  - Cookie 설정·제거 또는 갱신 helper 추가 검토

web/src/app/api/beta-auth/route.ts
  - 인증 성공 시 두 token과 Cookie 발급

web/src/middleware.ts
  - Access 실패 시 Refresh 검증
  - Access 재발급
  - downstream request Cookie와 response Cookie 동시 갱신
  - 완전한 인증 실패 시 두 Cookie 제거

web/src/lib/auth/beta-token.test.ts
web/src/app/api/beta-auth/route.test.ts
web/src/middleware.test.ts
  - 변경된 token과 갱신 흐름 테스트

docs/beta-access.md
web/.env.example
  - 운영 문서 갱신
  - 환경 변수 key는 변경하지 않으므로 .env.example 내용은 유지
```

UI와 `BetaAccessForm`은 인증 성공 API가 동일하므로 변경하지 않는다.

## 12. 테스트 계획

### Token 단위 테스트

1. Access Token 생성 및 검증 성공
2. Refresh Token 생성 및 검증 성공
3. Access Token을 Refresh 검증 함수에 전달하면 실패
4. Refresh Token을 Access 검증 함수에 전달하면 실패
5. 각 token의 변조·만료·다른 secret을 거부
6. `BETA_JWT_SECRET` 누락 또는 32바이트 미만 처리

### 인증 API 테스트

1. 정상 코드는 Access/Refresh Cookie 두 개를 발급
2. Access Cookie max-age는 15분
3. Refresh Cookie max-age는 7일
4. 두 Cookie 모두 HttpOnly, SameSite=Lax, Path=/
5. production에서는 Secure 적용
6. 응답 body에 두 token이 포함되지 않음
7. 잘못된 코드와 서버 설정 오류에서는 Cookie를 발급하지 않음

### Middleware 테스트

1. 유효한 Access Token → 요청 통과, 재발급 없음
2. Access 만료 + 유효한 Refresh → 요청 통과, 새 Access Cookie 발급
3. Access 없음 + 유효한 Refresh → 요청 통과, 새 Access Cookie 발급
4. Access 변조 + 유효한 Refresh → 요청 통과, 새 Access Cookie 발급
5. Access 유효 + Refresh 없음 → 요청 통과
6. 두 token 없음 → 페이지 redirect/API 401
7. Refresh 만료·변조 → 페이지 redirect/API 401 및 두 Cookie 제거
8. Refresh Token을 Access Cookie에 넣어도 실패
9. 새 Access Token이 같은 요청의 Route Handler에 전달됨
10. Refresh 상태로 `/beta` 접근 → Access 재발급 후 `/` redirect
11. 공개 API와 정적 리소스는 token 없이 통과

### 실제 브라우저 검증

1. `/beta`에서 정상 코드 입력 후 두 HttpOnly Cookie 발급 확인
2. `/` 및 와인 페이지 접근 성공
3. Access Cookie만 삭제한 뒤 새 요청 시 자동 복구 확인
4. Access Cookie를 변조한 뒤 새 요청 시 자동 복구 확인
5. Refresh Cookie까지 삭제하면 `/beta` 이동 확인
6. 보호 BFF 호출 시 만료 Access Token이 자동 갱신되고 현재 API 호출도 성공하는지 확인
7. 7일 만료 Refresh Token은 `/beta` 재인증을 요구하는지 확인

검증 명령:

```text
npm run test:unit
npx tsc --noEmit
npm run build
npm run build-storybook
```

검증 완료 후 프론트엔드 프로세스를 재시작하고 Playwright Chrome으로 주요 흐름을 확인한다.

## 13. 완료 기준

- Access Token의 JWT와 Cookie 만료가 15분이다.
- Refresh Token의 JWT와 Cookie 만료가 7일이다.
- 두 token은 HttpOnly Cookie에만 저장되고 클라이언트 코드에 노출되지 않는다.
- Access Token이 유효하면 Refresh Token 검증이나 재발급을 하지 않는다.
- Access Token이 유효하지 않고 Refresh Token이 유효하면 현재 페이지/API 요청이 중단되지 않고 Access Token이 갱신된다.
- 갱신된 Access Token으로 중요 BFF의 Route Handler 재검증도 같은 요청에서 통과한다.
- 두 token이 모두 유효하지 않으면 페이지는 `/beta`, API는 `401`로 처리된다.
- 공개 경로와 정적 리소스 정책은 기존과 동일하다.
- 환경 변수와 외부 패키지를 추가하지 않는다.
- 단위 테스트, TypeScript, production build, Storybook build 및 브라우저 시나리오가 통과한다.

## 14. 구현하지 않는 항목

- Refresh Token rotation 및 reuse detection
- DB/Redis 기반 session allowlist 또는 denylist
- 사용자별·기기별 세션 목록과 강제 로그아웃
- 회원 로그인, 역할 및 권한
- 장기 로그인 선택 옵션
- 별도 refresh API와 클라이언트 retry interceptor

이 기능들이 필요해지는 시점에는 현재 stateless 베타 게이트를 확장하기보다 정식 세션 인증 구조로 전환하는 편이 적절하다.
