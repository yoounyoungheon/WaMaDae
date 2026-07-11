import { cn } from "@/app/utils/style/helper";
import DefaultMenuCategoryCard from "./DefaultMenuCategoryCard";
import type { DefaultMenuCategoryGridProps } from "./menu-category-recommendation-result.props";

/**
 * 서버에서 받지 않은 기본 메뉴 카테고리 3열 카드 Grid.
 */
export default function DefaultMenuCategoryGrid({
  categories,
  selectedCategories = [],
  onToggleCategory,
  className,
}: DefaultMenuCategoryGridProps) {
  return (
    <ul className={cn("grid grid-cols-3 gap-3", className)}>
      {categories.map((category) => (
        <li key={category.id}>
          <DefaultMenuCategoryCard
            category={category}
            isSelected={selectedCategories.includes(category.name)}
            onToggle={onToggleCategory}
          />
        </li>
      ))}
    </ul>
  );
}
