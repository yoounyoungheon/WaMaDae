# 관측사항

- OCR 분석 결과는 현재 `RecommendPage`의 클라이언트 state에만 저장된다.
- `/main/recommend` 라우트의 초기 상태는 `searchParams.status`만 기준으로 계산된다.
- 업로드 버튼은 더 이상 URL을 `?status=analysis`로 갱신하지 않으므로, OCR 성공 직후 새로고침하거나 같은 URL로 재진입하면 분석 결과가 사라진다.
- 성공 상태와 결과를 URL, 서버, 또는 별도 저장소 중 하나에 반영하는 보존 전략이 필요하다.
