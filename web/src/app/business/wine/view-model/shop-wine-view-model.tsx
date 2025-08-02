/**
 * @interface ShopWineViewModel
 * @description 업장 화면에서 와인 정보를 나타내는 뷰 모델 인터페이스
 */
export interface ShopWineViewModel {
  /** 와인 고유 ID */
  id: number;
  /** 향,맛 키워드 */
  taseInfo: string[];
  /** 와인 이름 */
  name: string;
  /** 포도 품종 */
  variety: string;
  /** 와마대의 한줄평 */
  commentOfMySom: string | null;
  /** 당도 (1~5 스케일) */
  sweetness: number;
  /** 바디감 (1~5 스케일) */
  body: number;
  /** 타닌 (1~5 스케일) */
  tannin: number;
  /** 산도 (1~5 스케일) */
  acidity: number;
  /** 와인 이미지 URL */
  image: string;
  /** 와인 설명 (선택적 필드) */
  description?: string | null;
}

export const createShopWineViewModel = (
  id: number,
  taseInfo: string[],
  name: string,
  variety: string,
  commentOfMySom: string | null,
  sweetness: number,
  body: number,
  tannin: number,
  acidity: number,
  image: string,
  description?: string | null
): ShopWineViewModel => {
  return {
    id,
    taseInfo,
    name,
    variety,
    commentOfMySom,
    sweetness,
    body,
    tannin,
    acidity,
    image,
    description: description || null,
  };
};