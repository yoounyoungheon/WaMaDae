/**
 * AI 추천 결과 아래에 항상 노출하는 기본 메뉴 카테고리 목록.
 * API 추천에 없는 메뉴를 직접 선택할 수 있도록 이름과 아이콘을 관리한다.
 */
export const DEFAULT_MENU_CATEGORIES = [
  {
    id: "meat",
    name: "고기",
    iconPath: "/images/menu-categories/meat.svg",
  },
  {
    id: "pizza",
    name: "피자",
    iconPath: "/images/menu-categories/pizza.svg",
  },
  {
    id: "cheese",
    name: "치즈",
    iconPath: "/images/menu-categories/cheese.svg",
  },
  {
    id: "pasta",
    name: "파스타",
    iconPath: "/images/menu-categories/pasta.svg",
  },
  {
    id: "salad",
    name: "샐러드",
    iconPath: "/images/menu-categories/salad.svg",
  },
  {
    id: "sushi",
    name: "회/초밥",
    iconPath: "/images/menu-categories/sushi.svg",
  },
  {
    id: "noodles",
    name: "면 요리",
    iconPath: "/images/menu-categories/noodles.svg",
  },
  {
    id: "stew-soup",
    name: "찌개/국",
    iconPath: "/images/menu-categories/stew-soup.svg",
  },
  {
    id: "dessert",
    name: "디저트",
    iconPath: "/images/menu-categories/dessert.svg",
  },
  {
    id: "burger",
    name: "햄버거",
    iconPath: "/images/menu-categories/burger.svg",
  },
  {
    id: "seafood",
    name: "해산물",
    iconPath: "/images/menu-categories/seafood.svg",
  },
] as const satisfies readonly {
  id: string;
  name: string;
  iconPath: string;
}[];

export type DefaultMenuCategory = (typeof DEFAULT_MENU_CATEGORIES)[number];
export type DefaultMenuCategoryId = DefaultMenuCategory["id"];
