import type {
  Wine,
  WineDetailDto,
  WineSearchItem,
  WineSearchItemDto,
} from "../model/wine.type";
import { inferWineType, normalizeWineType } from "../lib/wine-image";

export function mapWineDetailDto(dto: WineDetailDto): Wine {
  const name = dto.display_name.trim();

  return {
    id: dto.id,
    name,
    imageUrl: dto.image_url?.trim() ?? "",
    wineType:
      normalizeWineType(dto.wine_type ?? dto.wineType ?? dto.type) ??
      inferWineType(name),
    rating: dto.rating,
    title: dto.title,
    recommendationText: dto.recommendation_text,
    priceLabel: dto.price_label,
  };
}

export function mapWineSearchItemDto(dto: WineSearchItemDto): WineSearchItem {
  return {
    ...mapWineDetailDto(dto.append_wine),
    id: dto.id,
    name: dto.name,
    regionAndType: dto.region_and_type,
    searchPriceLabel: dto.price_label,
  };
}
