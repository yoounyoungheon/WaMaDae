import { describe, expect, it } from "vitest";
import { groupRecommendedMenusByCategory } from "./group-recommended-menus";
import type { RecommendedMenu } from "../model/menu-category-recommendation.type";

describe("groupRecommendedMenusByCategory", () => {
  it("category로 그루핑하되 category/메뉴 순서는 첫 등장 순서를 유지한다", () => {
    const menus: RecommendedMenu[] = [
      { name: "해산물 파전", category: "해산물" },
      { name: "바지락 오일 파스타", category: "파스타 및 면" },
      { name: "감바스", category: "해산물" },
    ];

    expect(groupRecommendedMenusByCategory(menus)).toEqual([
      {
        category: "해산물",
        menus: [
          { name: "해산물 파전", category: "해산물" },
          { name: "감바스", category: "해산물" },
        ],
      },
      {
        category: "파스타 및 면",
        menus: [{ name: "바지락 오일 파스타", category: "파스타 및 면" }],
      },
    ]);
  });

  it("빈 목록은 빈 그룹 배열을 반환한다", () => {
    expect(groupRecommendedMenusByCategory([])).toEqual([]);
  });
});
