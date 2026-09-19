/**
 * 와인 DB(카탈로그/와인21) 매칭 데이터를 제외할지 여부.
 *
 * `NEXT_PUBLIC_` 값이라 BFF(서버)와 클라이언트 컴포넌트 양쪽에서 읽을 수 있다.
 * - `true`(기본): 추출 단계에서 카탈로그 매칭 항목을 제외하고, 추천 상세의 와인 정보(품종/빈티지/도수)
 *   영역을 "준비 중" 오버레이로 덮는다.
 * - `false`: 카탈로그 데이터를 포함하고 실제 정보를 표시한다.
 *
 * 값 변경 후 dev 서버/빌드를 재시작해야 반영된다(빌드 타임 인라인).
 */
export function isCatalogExcluded(): boolean {
  return process.env.NEXT_PUBLIC_WINE_EXCLUDE_CATALOG !== "false";
}
