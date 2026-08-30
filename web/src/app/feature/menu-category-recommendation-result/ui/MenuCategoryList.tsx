import { cn } from "@/app/utils/style/helper";
import MenuCategoryItem from "./MenuCategoryItem";
import type { MenuCategoryListProps } from "./menu-category-recommendation-result.props";

/**
 * 추천된 메뉴 카테고리 리스트.
 * API가 문자열만 제공하고 중복 가능성이 있으므로 key는 `${category}-${index}`를 사용하고
 * 응답 순서를 그대로 표시한다.
 */
export default function MenuCategoryList({
  categories,
  selectedCategories = [],
  onToggleCategory,
  className,
}: MenuCategoryListProps) {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {categories.map((category, index) => (
        <MenuCategoryItem
          key={`${category}-${index}`}
          category={category}
          isSelected={selectedCategories.includes(category)}
          onToggle={onToggleCategory}
        />
      ))}
    </ul>
  );
}
