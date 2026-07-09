# Mysom Upload API

파일 업로드를 위한 pre-signed URL 발급 API다.

## POST /v1/upload/presigned-menu-image-url

메뉴 이미지 업로드에 사용할 pre-signed URL과 저장될 파일명을 발급한다.

주의: 현재 `R2ImageUploadService.generatePreSignedMenuImageUrl` 구현이 `TODO("Not implemented yet")` 상태다. 계약은 컨트롤러/DTO 기준으로 정리하지만, 실제 호출은 500 계열 오류가 날 수 있다.

### Request

```http
POST /v1/upload/presigned-menu-image-url
Authorization: Bearer {token}
Content-Type: application/json
```

```ts
type PresignedMenuImageUrlRequest = {
  imageType: "png" | "jpg" | "jpeg";
  restaurantId: number;
};
```

| 필드 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `imageType` | `string` | 예 | `png`, `jpg`, `jpeg` 중 하나 |
| `restaurantId` | `number` | 예 | `1` 이상 |

예시:

```json
{
  "imageType": "png",
  "restaurantId": 1
}
```

현재 컨트롤러는 `restaurantId`를 validation만 하고 서비스 호출에는 넘기지 않는다.

### Response

Status: `200 OK`

```ts
type PreSignedUrlResponse = {
  preSignedUrl: string;
  expireAt: number;
  imageFileName: string;
};
```

| 필드 | 설명 |
| --- | --- |
| `preSignedUrl` | 이미지 파일을 업로드할 URL |
| `expireAt` | URL 만료 시각. UTC epoch milliseconds |
| `imageFileName` | 서버가 저장 대상으로 보는 파일 경로 또는 파일명 |

예시:

```json
{
  "preSignedUrl": "https://s3.r2.cloudflarestorage.com/my-bucket/temp/example.png",
  "expireAt": 1760000000000,
  "imageFileName": "temp/example.png"
}
```

### 프론트엔드 사용 흐름

1. 이 API로 `preSignedUrl`을 발급받는다.
2. 응답받은 URL로 이미지 파일을 직접 업로드한다.
3. 업로드 요청의 `Content-Type`은 `imageType`과 맞춰 보낸다. `jpg`, `jpeg`는 `image/jpeg`, `png`는 `image/png`다.
4. 후속 API가 `imageFileName`을 요구한다면 응답 값을 저장해 둔다.

업로드 서비스가 현재 미구현이므로 1단계 이후의 서버 보장 동작은 아직 확정된 계약으로 보면 안 된다.

### Error cases

| Status | 조건 | 응답 |
| --- | --- | --- |
| `400 Bad Request` | `imageType`이 허용값이 아님 | `BadRequestErrorResponse` |
| `400 Bad Request` | `restaurantId < 1` | `BadRequestErrorResponse` |
| `401 Unauthorized` | 인증 토큰 없음 또는 유효하지 않음 | Spring Security 오류 응답 |
| `500 Internal Server Error` | 현재 서비스 미구현 또는 R2 URL 생성 실패 | Spring 오류 응답 또는 `ErrorResponse` |
