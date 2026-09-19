# Mysom Auth API 상태

- 기준 백엔드: `mysom-api-demo` `68a0cb7`
- 상태: 활성 인증 API 없음

현재 API 모듈에는 로그인, 회원가입, token refresh, logout 컨트롤러와 Spring Security filter chain이 없다. 다음 경로는 호출 대상이 아니다.

- `POST /v1/auth/login`
- `POST /v1/auth/signup`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`

현재 활성 와인 페어링 API에는 `Authorization` header를 요구하지 않는다. 향후 gateway나 Spring Security가 추가되면 인증 방식, cookie/token 보관 위치, BFF 전달 정책을 별도 계약으로 정의해야 한다.
