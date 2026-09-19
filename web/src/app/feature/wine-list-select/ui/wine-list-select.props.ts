import type {
  ExtractedWine,
  MenuImagePreview,
  WineId,
} from "@/app/entity/wine/model/wine.type";

export interface WineListSelectPageProps {
  className?: string;
}

export interface WineMenuPhotoSectionProps {
  previews: MenuImagePreview[];
  isAnalyzing?: boolean;
  imageErrorMessage?: string | null;
  extractionErrorMessage?: string | null;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onAnalyze: () => void;
  className?: string;
}

export interface ExtractedWineSectionProps {
  wines: ExtractedWine[];
  selectedWineIds: WineId[];
  onToggleWine: (wineId: WineId) => void;
  title?: string;
  className?: string;
}

export interface ExtractedWineCardProps {
  wine: ExtractedWine;
  isSelected?: boolean;
  onToggle: (wineId: WineId) => void;
  className?: string;
}

export interface NextRecommendationButtonProps {
  sessionId: string | null;
  selectedWineIds: WineId[];
  className?: string;
}
