"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { MenuCategoryRecommendationRequest } from "@/app/entity/menu-category-recommendation/model/menu-category-recommendation.type";
import { buildWinePairingRequest } from "@/app/entity/wine-pairing/lib/build-wine-pairing-request";
import { saveWinePairingRequest } from "@/app/entity/wine-pairing/lib/wine-pairing-request-storage";
import Button from "@/app/shared/ui/atom/button";
import LoadingSpinner from "@/app/shared/ui/atom/loading-spinner";
import { cn } from "@/app/utils/style/helper";
import { useMenuCategoryRecommendationsQuery } from "../api/use-menu-category-recommendations-query";
import { useStoredMenuCategoryRecommendationRequest } from "../lib/use-stored-recommendation-request";
import { DEFAULT_MENU_CATEGORIES } from "../model/default-menu-categories";
import DefaultMenuCategoryGrid from "./DefaultMenuCategoryGrid";
import MenuCategoryList from "./MenuCategoryList";
import type { MenuCategoryRecommendationPageProps } from "./menu-category-recommendation-result.props";

/** 선택한 와인을 기준으로 메뉴 카테고리를 고르는 화면. */
export default function MenuCategoryRecommendationPage({
  className,
}: MenuCategoryRecommendationPageProps) {
  const router = useRouter();
  const { request, isHydrated } = useStoredMenuCategoryRecommendationRequest();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [areOtherCategoriesOpen, setAreOtherCategoriesOpen] = useState(false);
  const selectedCount = selectedCategories.length;

  const toggleCategory = (category: string) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter(
            (selectedCategory) => selectedCategory !== category
          )
        : [...currentCategories, category]
    );
  };

  const pairingRequest = buildWinePairingRequest(
    request?.wineIds ?? [],
    selectedCategories
  );
  const canRequestPairing =
    pairingRequest.wineIds.length > 0 &&
    pairingRequest.menuCategories.length > 0;

  const handleRequestPairing = () => {
    if (!canRequestPairing) return;

    saveWinePairingRequest(pairingRequest);
    router.push("/wine/chat");
  };

  return (
    <main
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        <div className="mx-auto flex min-h-full w-full max-w-[680px] flex-col px-5 pb-10 pt-5">
          <section
            className="pb-7"
            aria-labelledby="menu-recommendation-intro-title"
          >
            <h2
              id="menu-recommendation-intro-title"
              className="text-[25px] font-extrabold leading-tight text-ink-page"
            >
              어울리는 메뉴를 골라봤어요
            </h2>
            <p className="mt-3 text-[14px] font-medium leading-relaxed text-ink-secondary">
              선택한 와인을 기준으로 마이쏨이 추천했어요
            </p>
          </section>

          <section aria-labelledby="ai-recommended-menu-category-title">
            <div className="flex min-h-5 items-center justify-between gap-4">
              <h2 id="ai-recommended-menu-category-title" className="sr-only">
                추천 메뉴 카테고리
              </h2>
              {selectedCount > 0 ? (
                <p className="ml-auto text-[13px] font-bold text-primary">
                  {selectedCount}개 선택
                </p>
              ) : null}
            </div>

            <div className="mt-3">
              {!isHydrated ? (
                <RecommendationStatePanel
                  tone="pending"
                  message="추천 메뉴를 불러오고 있어요."
                />
              ) : request && request.wineIds.length > 0 ? (
                <RecommendationResult
                  request={request}
                  selectedCategories={selectedCategories}
                  onToggleCategory={toggleCategory}
                />
              ) : (
                <RecommendationStatePanel
                  tone="empty"
                  message="선택된 와인이 없어요. 먼저 와인을 선택해 주세요."
                  action={
                    <Button
                      asChild
                      variant="outline"
                      type="primary"
                      radius="lg"
                      className="h-11 rounded-[14px] border border-white/60 bg-white/[0.05] px-6 py-3 text-[14px] font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_8px_22px_rgba(72,52,112,0.05)] backdrop-blur-xl hover:bg-white/[0.12]"
                    >
                      <Link href="/wine/list">와인 선택하러 가기</Link>
                    </Button>
                  }
                />
              )}
            </div>
          </section>

          <section
            className="mt-10"
            aria-labelledby="default-menu-category-title"
          >
            <p className="text-[13px] font-medium text-ink-secondary">
              원하는 메뉴가 없나요?
            </p>
            <button
              type="button"
              aria-expanded={areOtherCategoriesOpen}
              aria-controls="default-menu-category-grid"
              onClick={() => setAreOtherCategoriesOpen((isOpen) => !isOpen)}
              className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-[16px] border border-white/55 bg-white/[0.04] px-4 text-[14px] font-bold text-ink-emphasis shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_22px_rgba(72,52,112,0.04)] backdrop-blur-2xl backdrop-saturate-150 transition-colors hover:border-white/75 hover:bg-white/[0.10]"
            >
              <span id="default-menu-category-title">다른 메뉴 보기</span>
              {areOtherCategoriesOpen ? (
                <ChevronUp className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden />
              )}
            </button>

            {areOtherCategoriesOpen ? (
              <div id="default-menu-category-grid">
                <DefaultMenuCategoryGrid
                  categories={DEFAULT_MENU_CATEGORIES}
                  selectedCategories={selectedCategories}
                  onToggleCategory={toggleCategory}
                  className="mt-4"
                />
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <div className="shrink-0 border-t border-white/60 bg-canvas/75 px-5 pb-[calc(14px_+_env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(60,45,96,0.06)] backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto w-full max-w-[640px]">
          <Button
            htmlType="button"
            variant="solid"
            type="primary"
            radius="lg"
            disabled={!canRequestPairing}
            onClick={handleRequestPairing}
            className="h-[52px] w-full rounded-[18px] border border-white/60 bg-white/[0.08] text-[15px] font-bold text-ink-emphasis shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_12px_28px_rgba(72,52,112,0.07)] backdrop-blur-2xl backdrop-saturate-150 hover:bg-white/[0.14] disabled:!border-white/40 disabled:!bg-white/[0.02] disabled:!text-ink-muted disabled:!opacity-100"
          >
            와인 추천받기
          </Button>
        </div>
      </div>
    </main>
  );
}

function RecommendationResult({
  request,
  selectedCategories,
  onToggleCategory,
}: {
  request: MenuCategoryRecommendationRequest;
  selectedCategories: readonly string[];
  onToggleCategory: (category: string) => void;
}) {
  const { data, error, isLoading, isFetching, refetch } =
    useMenuCategoryRecommendationsQuery(request);

  if (isLoading) {
    return (
      <RecommendationStatePanel
        tone="pending"
        message="추천 메뉴를 불러오고 있어요."
      />
    );
  }

  if (error) {
    return (
      <RecommendationStatePanel
        tone="error"
        message={
          error instanceof Error
            ? error.message
            : "추천 메뉴를 불러오지 못했습니다."
        }
        action={
          <RetryButton onRetry={() => refetch()} isRetrying={isFetching} />
        }
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <RecommendationStatePanel
        tone="empty"
        message="추천된 메뉴 카테고리가 없어요."
      />
    );
  }

  return (
    <MenuCategoryList
      categories={data}
      selectedCategories={selectedCategories}
      onToggleCategory={onToggleCategory}
    />
  );
}

type StatePanelTone = "pending" | "error" | "empty";

function RecommendationStatePanel({
  tone,
  message,
  action,
}: {
  tone: StatePanelTone;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div
      role={
        tone === "error" ? "alert" : tone === "pending" ? "status" : undefined
      }
      className="flex flex-col items-center justify-center gap-4 rounded-[16px] border border-white/55 bg-white/[0.04] px-5 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_10px_26px_rgba(72,52,112,0.04)] backdrop-blur-2xl backdrop-saturate-150"
    >
      {tone === "pending" ? (
        <LoadingSpinner label="추천 메뉴 불러오는 중" className="h-10 w-10" />
      ) : null}
      <p
        className={cn(
          "text-[15px] leading-relaxed",
          tone === "error" ? "text-error-main" : "text-ink-secondary"
        )}
      >
        {message}
      </p>
      {action}
    </div>
  );
}

function RetryButton({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <Button
      htmlType="button"
      variant="outline"
      type="primary"
      radius="lg"
      disabled={isRetrying}
      onClick={onRetry}
      className="h-11 gap-2 rounded-[14px] border border-white/60 bg-white/[0.05] px-6 py-3 text-[14px] font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_8px_22px_rgba(72,52,112,0.05)] backdrop-blur-xl hover:bg-white/[0.12]"
    >
      {isRetrying ? (
        <>
          <LoadingSpinner label="다시 시도 중" className="h-5 w-5" />
          다시 시도 중
        </>
      ) : (
        "다시 시도"
      )}
    </Button>
  );
}
