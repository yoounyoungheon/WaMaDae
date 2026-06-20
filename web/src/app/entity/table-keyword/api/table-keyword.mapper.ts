import type {
  TableKeyword,
  TableKeywordDto,
} from "../model/table-keyword.type";

export function mapTableKeywordDto(dto: TableKeywordDto): TableKeyword {
  return {
    id: dto.id,
    name: dto.name,
    emojiPath: dto.emojiPath,
    displayOrder: dto.display_order,
  };
}
