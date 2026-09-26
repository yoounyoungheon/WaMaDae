# 베타 사용자 접근 인증

## 목적

베타 테스트 기간에 공유 접근 코드를 받은 사용자만 마이쏨 웹과 와인 추천 BFF를 사용할 수 있게 한다. 회원 계정이나 사용자별 권한을 제공하는 로그인 시스템은 아니다.

## 환경 변수

로컬에서는 `web/.env.local`, 배포 환경에서는 secret 설정에 다음 값을 추가한다.

```env
BETA_ACCESS_CODE=참여자에게_전달할_접근_코드
BETA_JWT_SECRET=32바이트_이상의_무작위_문자열
```

- 두 값에 `NEXT_PUBLIC_` 접두사를 붙이지 않는다.
- 실제 값은 Git에 커밋하지 않는다.
- `BETA_JWT_SECRET`은 최소 32바이트여야 한다.
- 값을 변경하면 기존 JWT는 더 이상 유효하지 않으므로 모든 사용자가 다시 인증해야 한다.

## 인증 흐름

```text
GET /beta
→ 접근 코드 입력
→ POST /api/beta-auth
→ BETA_ACCESS_CODE 비교
→ HS256 JWT 발급(type=beta, 7일 만료)
→ beta_access HttpOnly Cookie 설정
→ /
→ middleware와 중요 BFF에서 Cookie 검증
```

JWT는 응답 body, URL, localStorage 또는 sessionStorage에 포함되지 않는다.

Cookie 정책:

```text
name: beta_access
httpOnly: true
secure: production에서 true
sameSite: lax
path: /
maxAge: 7일
```

## 경로 보호

### 공개 경로

- `/beta`
- `/api/beta-auth`
- `/api/health`
- `/_next/static/*`
- `/_next/image/*`
- favicon, robots, sitemap 및 `public/` 정적 파일

유효한 Cookie를 가진 사용자가 `/beta`에 접근하면 `/`로 이동한다.

### 보호 경로

- `/`, `/wine/list`, `/wine/keywords`, `/wine/chat`을 포함한 나머지 페이지
- 아래 와인 BFF:
  - `/api/wine-pairings/extract-wine-menu`
  - `/api/wine-pairings/recommend-menu`
  - `/api/wine-pairings/pairing`
  - `/api/wine-pairings/chat`

보호 페이지의 인증 실패는 `/beta` redirect로 처리한다. 보호 API의 인증 실패는 HTML redirect 대신 `401` JSON을 반환한다.

와인 BFF는 Middleware뿐 아니라 각 Route Handler에서도 `beta_access`를 다시 검증한다. 인증되지 않은 요청은 backend API를 호출하기 전에 종료된다.

## 오류 처리

- 잘못된 접근 코드: `401`, `유효하지 않은 접근 코드입니다.`
- 잘못된 request 형식: `400`
- 환경 변수 누락 또는 짧은 JWT secret: `500`과 일반 오류 메시지
- 만료·변조·잘못된 payload token: 인증 실패

환경 변수 오류는 서버 로그에 key 이름만 기록한다. 접근 코드, secret 및 JWT 값은 기록하지 않는다.

## 운영 참고

- 이 기능은 하나의 공유 코드에 기반한 베타 게이트다. 사용자별 폐기, 감사 로그, 권한 구분은 지원하지 않는다.
- 코드가 노출되면 `BETA_ACCESS_CODE`를 교체한다.
- 모든 기존 Cookie를 즉시 무효화해야 하면 `BETA_JWT_SECRET`도 교체한다.
- 인터넷에 공개된 대규모 베타에서는 `/api/beta-auth`에 배포 플랫폼 또는 외부 저장소 기반 rate limit을 추가한다.
