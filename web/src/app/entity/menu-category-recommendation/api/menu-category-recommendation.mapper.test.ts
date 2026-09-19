import { describe, expect, it } from "vitest";
import { mapMenuRecommendationDto } from "./menu-category-recommendation.mapper";

describe("mapMenuRecommendationDto", () => {
  it("응답 순서(AI rank 순)를 유지하고 name/category를 보존한다", () => {
    const result = mapMenuRecommendationDto({
      recommendedMenus: [
        { name: "해산물 파전", category: "해산물" },
        { name: "바지락 오일 파스타", category: "파스타 및 면" },
      ],
    });

    expect(result).toEqual([
      { name: "해산물 파전", category: "해산물" },
      { name: "바지락 오일 파스타", category: "파스타 및 면" },
    ]);
  });

  it("name의 양끝 공백만 정리하고 내부는 그대로 둔다", () => {
    const result = mapMenuRecommendationDto({
      recommendedMenus: [{ name: "  안심 스테이크 ", category: "붉은 고기" }],
    });

    expect(result[0].name).toBe("안심 스테이크");
  });

  it("알 수 없는 category는 계약 오류로 던진다", () => {
    expect(() =>
      mapMenuRecommendationDto({
        recommendedMenus: [{ name: "치킨", category: "치킨류" }],
      })
    ).toThrow(/Unknown menu category/);
  });

  it("빈 name은 계약 오류로 던진다", () => {
    expect(() =>
      mapMenuRecommendationDto({
        recommendedMenus: [{ name: "   ", category: "해산물" }],
      })
    ).toThrow();
  });

  it("recommendedMenus가 배열이 아니면 오류를 던진다", () => {
    expect(() =>
      mapMenuRecommendationDto({
        recommendedMenus: undefined as never,
      })
    ).toThrow();
  });
});
