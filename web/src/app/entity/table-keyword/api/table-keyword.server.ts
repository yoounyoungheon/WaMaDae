import "server-only";

import type { TableKeywordDto } from "../model/table-keyword.type";

const mockTableKeywords: TableKeywordDto[] = [
  {
    id: "meat",
    name: "고기",
    emojiPath: "/images/table-keywords/meat.svg",
    display_order: 1,
  },
  {
    id: "pizza",
    name: "피자",
    emojiPath: "/images/table-keywords/pizza.svg",
    display_order: 2,
  },
  {
    id: "cheese",
    name: "치즈",
    emojiPath: "/images/table-keywords/cheese.svg",
    display_order: 3,
  },
  {
    id: "pasta",
    name: "파스타",
    emojiPath: "/images/table-keywords/pasta.svg",
    display_order: 4,
  },
  {
    id: "salad",
    name: "샐러드",
    emojiPath: "/images/table-keywords/salad.svg",
    display_order: 5,
  },
  {
    id: "sushi",
    name: "회/초밥",
    emojiPath: "/images/table-keywords/sushi.svg",
    display_order: 6,
  },
  {
    id: "noodles",
    name: "면 요리",
    emojiPath: "/images/table-keywords/noodles.svg",
    display_order: 7,
  },
  {
    id: "stew-soup",
    name: "찌개/국",
    emojiPath: "/images/table-keywords/stew-soup.svg",
    display_order: 8,
  },
  {
    id: "dessert",
    name: "디저트",
    emojiPath: "/images/table-keywords/dessert.svg",
    display_order: 9,
  },
  {
    id: "burger",
    name: "햄버거",
    emojiPath: "/images/table-keywords/burger.svg",
    display_order: 10,
  },
  {
    id: "seafood",
    name: "해산물",
    emojiPath: "/images/table-keywords/seafood.svg",
    display_order: 11,
  },
];

/**
 * 서버 전용 테이블 키워드 조회 함수.
 * 현재는 mock 목록을 반환하며, 실제 백엔드 연동 시 이 함수만 교체한다.
 * `display_order` 오름차순으로 정렬한 DTO 목록을 반환한다.
 */
export function getTableKeywords(): TableKeywordDto[] {
  return [...mockTableKeywords].sort(
    (left, right) => left.display_order - right.display_order
  );
}
