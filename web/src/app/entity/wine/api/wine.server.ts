import "server-only";

import type { WineDetailDto, WineSearchItemDto } from "../model/wine.type";

const mockSearchWines: WineSearchItemDto[] = [
  {
    id: "wine-search-1",
    name: "와인 이름 1",
    region_and_type: "프랑스, 보르도",
    price_label: "25,000원",
    append_wine: {
      id: "wine-search-1",
      display_name: "와인 이름 1",
      image_url: "/ExampleImage.png",
      rating: 4.3,
      title: "몬테스 알파 카베르네 소비뇽 2021",
      recommendation_text: "진한 풍미를 원한다면 추천",
      price_label: "35,000원",
    },
  },
  {
    id: "wine-search-2",
    name: "와인 이름 2",
    region_and_type: "프랑스, 보르도",
    price_label: "25,000원",
    append_wine: {
      id: "wine-search-2",
      display_name: "와인 이름 2",
      image_url: "/ExampleImage.png",
      rating: 4.1,
      title: "샤토 마고 그랑 크뤼 2019",
      recommendation_text: "부드러운 탄닌과 긴 여운",
      price_label: "82,000원",
    },
  },
  {
    id: "wine-search-3",
    name: "와인 이름 3",
    region_and_type: "프랑스, 보르도",
    price_label: "25,000원",
    append_wine: {
      id: "wine-search-3",
      display_name: "와인 이름 3",
      image_url: "/ExampleImage.png",
      rating: 4.0,
      title: "루이라뚜르 샤블리 2022",
      recommendation_text: "상큼한 산미를 원한다면 추천",
      price_label: "42,000원",
    },
  },
];

const mockAnalyzedWines: WineDetailDto[] = [
  {
    id: "analyzed-wine-1",
    display_name: "몬테스 알파 카베르네 소비뇽",
    image_url: "/ExampleImage.png",
    rating: 4.3,
    title: "몬테스 알파 카베르네 소비뇽 2021",
    recommendation_text: "진한 풍미를 원한다면 추천",
    price_label: "35,000원",
  },
];

export function searchWines(query: string): WineSearchItemDto[] {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length === 0) {
    return [];
  }

  const normalizedQuery = trimmedQuery.toLowerCase();
  const filteredWines = mockSearchWines.filter((wine) =>
    getSearchableWineText(wine).includes(normalizedQuery)
  );

  return filteredWines;
}

export function analyzeWineList(menuImage: File): WineDetailDto[] {
  void menuImage;
  return mockAnalyzedWines;
}

function getSearchableWineText(wine: WineSearchItemDto) {
  return [wine.name, wine.region_and_type, wine.append_wine.title]
    .join(" ")
    .toLowerCase();
}
