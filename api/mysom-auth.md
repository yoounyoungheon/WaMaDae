# Mysom Auth API

`mysom-api`에는 현재 로그인/회원가입 컨트롤러가 없다. 이 문서는 Spring Security logout matcher가 처리하는 라우트만 정리한다.

## POST /v1/auth/logout

현재 bearer token을 서버 저장소에서 무효화한다. 유효한 인증 정보가 없어도 Spring Security logout success handler는 `200 OK`를 반환한다.

### Request

```http
POST /v1/auth/logout
Authorization: Bearer {token}
```

Body 없음.

### Response

Status: `200 OK`

Body 없음.

### 프론트엔드 처리

- 로그아웃 버튼에서는 이 API 호출 성공 여부와 별개로 클라이언트의 인증 상태를 정리하는 것이 안전하다.
- 유효한 `Authorization` 헤더가 있으면 서버 token repository에서 해당 token을 invalidate한다.
- `Authorization` 헤더가 없거나 인증 객체가 없으면 서버에서는 사실상 no-op으로 처리한다.

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `500 Internal Server Error` | token repository 처리 실패 등 서버 내부 오류 | Spring/Security 오류 응답 또는 `ErrorResponse` |

## 현재 없는 라우트

아래 DTO/서비스 일부는 코드에 존재하지만 컨트롤러 라우트는 없다.

- `POST /v1/auth/login`
- `POST /v1/auth/signup`
- `POST /v1/auth/refresh`
