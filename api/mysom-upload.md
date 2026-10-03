# Mysom Upload API 상태

- 기준 백엔드: `mysom-api-demo` `feature/wine-sample` (기존 계약 확인: `68a0cb7`)
- 상태: presigned upload API 제거됨

현재 API 모듈에는 `/v1/upload/presigned-menu-image-url` 컨트롤러가 없다. 와인 메뉴 이미지는 외부 저장소에 먼저 올리지 않고 다음 API의 multipart file part로 직접 전송한다.

```http
POST /v1/wine-pairings/extract-wine-menu
X-Session-Id: {uuid}
Content-Type: multipart/form-data
```

part 이름은 `wineMenuImages`이며 PNG/JPEG 파일을 하나 이상 반복할 수 있다. 상세 계약은 [Mysom 와인 메뉴 추출 API](./mysom-ocr.md)를 참고한다.

프론트엔드는 presigned URL, `imageFileName`, `expireAt`, `restaurantId`를 현재 워크플로 상태나 요청 DTO에 두지 않는다.
