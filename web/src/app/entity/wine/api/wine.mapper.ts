import type {
  Wine,
  WineDetailDto,
  WineSearchItem,
  WineSearchItemDto,
} from "../model/wine.type";

export function mapWineDetailDto(dto: WineDetailDto): Wine {
  return {
    id: dto.id,
    name: dto.display_name,
    imageUrl: dto.image_url,
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
