export type TableKeywordId = string;

export type TableKeyword = {
  id: TableKeywordId;
  name: string;
  emojiPath: string;
  displayOrder: number;
};

/**
 * API DTO 타입.
 * 서버 응답의 snake_case shape이며, mapper를 통해서만 앱 모델로 변환한다.
 * UI 타입(TableKeyword)과 같은 타입으로 취급하지 않는다.
 */
export type TableKeywordDto = {
  id: string;
  name: string;
  emojiPath: string;
  display_order: number;
};
