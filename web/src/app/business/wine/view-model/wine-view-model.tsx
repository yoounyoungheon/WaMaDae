/**
 * @interface WineViewModel
 * @description 와인 정보를 나타내는 뷰 모델 인터페이스
 */
export interface WineViewModel {
  /** 와인 고유 ID */
  id: number;
  /** 와인 이름 */
  name: string;
  /** 생산 국가 */
  country: string;
  /** 와이너리 */
  winery: string;
  /** 생산 지역 */
  region: string;
  /** 생산 세부 지역 */
  subregion: string;
  /** 포도 품종 */
  variety: string;
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
  /** 와인 설명 */
  description: string | null;
}