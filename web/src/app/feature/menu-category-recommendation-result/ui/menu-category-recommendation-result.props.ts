import type { DefaultMenuCategory } from "../model/default-menu-categories";

export interface MenuCategoryRecommendationPageProps {
  className?: string;
}

export interface MenuCategoryListProps {
  categories: string[];
  selectedCategories?: readonly string[];
  onToggleCategory?: (category: string) => void;
  className?: string;
}

export interface MenuCategoryItemProps {
  category: string;
  isSelected?: boolean;
  onToggle?: (category: string) => void;
  className?: string;
}

export interface DefaultMenuCategoryGridProps {
  categories: readonly DefaultMenuCategory[];
  selectedCategories?: readonly string[];
  onToggleCategory?: (category: string) => void;
  className?: string;
}

export interface DefaultMenuCategoryCardProps {
  category: DefaultMenuCategory;
  isSelected?: boolean;
  onToggle?: (category: string) => void;
  className?: string;
}
