import type {
  MenuImagePreview,
  Wine,
  WineId,
  WineSearchItem,
} from "@/app/entity/wine/model/wine.type";

export interface WineListSelectPageProps {
  className?: string;
}

export interface NextRecommendationButtonProps {
  /** 추천 기준이 되는 선택 와인 목록. */
  wines: Wine[];
  /**
   * 선택 ID는 있으나 카드 데이터가 일부 누락된 상태.
   * `true`면 정확한 요청을 만들 수 없으므로 이동을 막는다.
   */
  hasMissingWineData?: boolean;
  className?: string;
}

export interface WineMenuPhotoSectionProps {
  isOpen: boolean;
  image: MenuImagePreview | null;
  isAnalyzing?: boolean;
  errorMessage?: string | null;
  onOpenChange: (isOpen: boolean) => void;
  onImageChange: (file: File | null) => void;
  onAnalyze: () => void;
  className?: string;
}

export interface PhotoUploadBoxProps {
  image: MenuImagePreview | null;
  accept?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onFileChange: (file: File | null) => void;
  className?: string;
}

export interface WineSearchSectionProps {
  query: string;
  results: WineSearchItem[];
  selectedWineIds: WineId[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onQueryChange: (query: string) => void;
  onSelectWine: (wine: WineSearchItem) => void;
  className?: string;
}

export interface WineSearchResultListProps {
  results: WineSearchItem[];
  selectedWineIds: WineId[];
  emptyMessage?: string;
  onSelectWine: (wine: WineSearchItem) => void;
  className?: string;
}

export interface WineSearchResultItemProps {
  wine: WineSearchItem;
  isSelected?: boolean;
  onSelect: (wine: WineSearchItem) => void;
  className?: string;
}

export interface SelectedWineSectionProps {
  wines: Wine[];
  title?: string;
  onRemoveWine?: (wineId: WineId) => void;
  className?: string;
}

export interface SelectedWineCardProps {
  wine: Wine;
  onRemove?: (wineId: WineId) => void;
  className?: string;
}
