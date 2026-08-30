import type { Wine, WineType } from "../model/wine.type";

const DEFAULT_WINE_IMAGES: Record<WineType, string> = {
  RED: "/images/wines/wine-red.png",
  WHITE: "/images/wines/wine-white.png",
  SPARKLING: "/images/wines/wine-sparkling.png",
};

const SPARKLING_KEYWORDS = [
  "sparkling",
  "champagne",
  "prosecco",
  "cava",
  "brut",
  "샴페인",
  "스파클링",
];

const WHITE_KEYWORDS = [
  "white",
  "blanc",
  "bianco",
  "chardonnay",
  "sauvignon",
  "riesling",
  "grigio",
  "chenin",
  "moscato",
  "화이트",
  "샤르도네",
  "소비뇽 블랑",
  "리슬링",
];

export function getWineImageUrl(wine: Wine): string {
  const imageUrl = wine.imageUrl?.trim();
  if (imageUrl) {
    return imageUrl;
  }

  return DEFAULT_WINE_IMAGES[
    wine.wineType ?? inferWineType(`${wine.name} ${wine.title}`)
  ];
}

export function normalizeWineType(value?: string | null): WineType | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();
  if (SPARKLING_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "SPARKLING";
  }
  if (WHITE_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "WHITE";
  }
  if (normalized === "red" || normalized.includes("레드")) {
    return "RED";
  }

  return null;
}

export function inferWineType(label: string): WineType {
  return normalizeWineType(label) ?? "RED";
}
