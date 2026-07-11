/**
 * `POST /v1/wine-pairing/menu-category/recommend` 요청 body.
 * 선택 DB 와인 목록을 기준으로 어울리는 메뉴 카테고리를 즉시 추천한다.
 * 각 필드는 공백일 수 없다.
 */
export type MenuCategoryRecommendationRequest = {
  wines: Array<{
    id: string;
    name: string;
    koreanName: string;
  }>;
};

/**
 * API DTO 타입.
 * 백엔드 응답 shape이며, mapper를 통해서만 앱 모델(string[])로 변환한다.
 */
export type MenuCategoryRecommendationDto = {
  menuCategories: Array<{ name: string }>;
};
