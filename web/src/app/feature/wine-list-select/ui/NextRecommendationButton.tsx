"use client";

import { useRouter } from "next/navigation";
import { buildMenuCategoryRecommendationRequest } from "@/app/entity/menu-category-recommendation/lib/build-menu-category-recommendation-request";
import { saveMenuCategoryRecommendationRequest } from "@/app/entity/menu-category-recommendation/lib/recommendation-request-storage";
import Button from "@/app/shared/ui/atom/button";
import { cn } from "@/app/utils/style/helper";
import type { NextRecommendationButtonProps } from "./wine-list-select.props";

/**
 * 선택 와인으로 메뉴 카테고리 추천 결과 화면(`/wine/keywords`)으로 이동한다.
 *
 * 추천 자체는 결과 화면이 동기 API로 수행하므로 이 버튼은 이동만 담당한다.
 * 요청을 만들 수 있는 와인이 하나도 없거나 카드 데이터가 누락되면 비활성화한다.
 */
export default function NextRecommendationButton({
  wines,
  hasMissingWineData = false,
  className,
}: NextRecommendationButtonProps) {
  const router = useRouter();

  const request = buildMenuCategoryRecommendationRequest(wines);
  const isDisabled = request.wineIds.length === 0 || hasMissingWineData;

  const handleClick = () => {
    // 선택 payload를 sessionStorage에 스냅샷해 결과 화면 리로드 시에도 복원되게 한다.
    saveMenuCategoryRecommendationRequest(request);
    router.push("/wine/keywords");
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        htmlType="button"
        variant="solid"
        type="primary"
        radius="lg"
        disabled={isDisabled}
        onClick={handleClick}
        className="h-11 w-full rounded-lg px-4 py-3 text-[14px] font-bold"
      >
        다음
      </Button>

      {hasMissingWineData ? (
        <p role="alert" className="text-[13px] text-error-main">
          와인 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}
    </div>
  );
}
