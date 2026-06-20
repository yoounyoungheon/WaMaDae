import type {
  TableKeyword,
  TableKeywordId,
} from "@/app/entity/table-keyword/model/table-keyword.type";

export interface TableKeywordSelectPageProps {
  className?: string;
}

export interface TableKeywordGridProps {
  keywords: TableKeyword[];
  selectedKeywordIds: TableKeywordId[];
  onToggleKeyword: (keywordId: TableKeywordId) => void;
  className?: string;
}

export interface TableKeywordCardProps {
  keyword: TableKeyword;
  isSelected: boolean;
  onToggle: (keywordId: TableKeywordId) => void;
  className?: string;
}

export interface SelectionSummaryProps {
  selectedCount: number;
  className?: string;
}
