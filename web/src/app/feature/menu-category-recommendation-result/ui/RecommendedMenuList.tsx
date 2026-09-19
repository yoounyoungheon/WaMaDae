import Image from "next/image";
import { groupRecommendedMenusByCategory } from "@/app/entity/menu-category-recommendation/lib/group-recommended-menus";
import { MENU_CATEGORY_ICON } from "@/app/entity/menu-category-recommendation/model/menu-category-recommendation.type";
import { cn } from "@/app/utils/style/helper";
import MenuNameBadge from "./MenuNameBadge";
import type { RecommendedMenuListProps } from "./menu-category-recommendation-result.props";

/**
 * 추천 메뉴 리스트. 응답을 category로 그루핑해 한 줄씩 표시한다.
 * 한 줄 = (카테고리 이모지) (카테고리 이름) + 메뉴 name 배지들.
 * category/메뉴 순서는 응답(AI rank) 순서를 유지하고, 배지는 name으로 선택을 토글한다.
 */
export default function RecommendedMenuList({
  menus,
  selectedNames = [],
  onToggleName,
  className,
}: RecommendedMenuListProps) {
  const selectedSet = new Set(selectedNames);
  const groups = groupRecommendedMenusByCategory(menus);

  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {groups.map((group) => (
        <li
          key={group.category}
          className="flex flex-col gap-3 rounded-[18px] border border-white/55 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_10px_26px_rgba(72,52,112,0.04)] backdrop-blur-2xl backdrop-saturate-150"
        >
          <span className="flex items-center gap-2">
            <Image
              src={MENU_CATEGORY_ICON[group.category]}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
            <span className="text-[15px] font-extrabold text-ink-card">
              {group.category}
            </span>
          </span>
          <div className="flex flex-wrap gap-2">
            {group.menus.map((menu, index) => (
              <MenuNameBadge
                key={`${menu.name}-${index}`}
                name={menu.name}
                isSelected={selectedSet.has(menu.name)}
                onToggle={onToggleName}
              />
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
