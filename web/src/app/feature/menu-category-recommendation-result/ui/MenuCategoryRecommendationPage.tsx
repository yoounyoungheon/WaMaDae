"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
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

/**
 * 추천 메뉴 결과 화면.
 *
 * 이전 단계(`/wine/ai`)의 `다음` 버튼이 sessionStorage에 스냅샷한 선택 payload를 읽어
 * 추천을 동기 조회한다. 이 덕분에 WebView 리로드/뒤로가기 후에도 결과가 복원된다.
 */
export default function MenuCategoryRecommendationPage({
  className,
}: MenuCategoryRecommendationPageProps) {
  const router = useRouter();
  const { request, isHydrated } =
    useStoredMenuCategoryRecommendationRequest();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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

  // 정수 ID 와인과 선택 카테고리가 모두 있어야 페어링을 요청할 수 있다.
  const pairingRequest = buildWinePairingRequest(
    request?.wines ?? [],
    selectedCategories
  );
  const canRequestPairing =
    pairingRequest.wines.length > 0 && pairingRequest.menuCategories.length > 0;

  const handleRequestPairing = () => {
    if (!canRequestPairing) {
      return;
    }
    // 페어링 payload를 sessionStorage에 스냅샷해 /wine/chat 리로드 시에도 복원되게 한다.
    saveWinePairingRequest(pairingRequest);
    router.push("/wine/chat");
  };

  return (
    <main
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        <div className="flex min-h-full flex-col gap-9 px-[23px] py-7">
          {selectedCount > 0 ? (
            <p className="rounded-xl border border-[#e8c6ff] bg-[#fcf6ff] px-3.5 py-3 text-[13px] font-bold leading-none text-primary-main">
              {selectedCount}개 선택됨
            </p>
          ) : null}

          <section aria-labelledby="ai-recommended-menu-category-title">
            <h2
              id="ai-recommended-menu-category-title"
              className="text-sm font-bold leading-tight text-primary-main"
            >
              마이쏨 AI가 추천하는 메뉴 카테고리에요.
            </h2>
            <div className="mt-4">
              {!isHydrated ? (
                <RecommendationStatePanel
                  tone="pending"
                  message="추천 메뉴를 불러오고 있어요."
                />
              ) : request && request.wines.length > 0 ? (
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
                      className="h-11 rounded-lg px-6 py-3 text-[14px] font-bold"
                    >
                      <Link href="/wine/ai">와인 선택하러 가기</Link>
                    </Button>
                  }
                />
              )}
            </div>
          </section>

          <section aria-labelledby="default-menu-category-title">
            <h2
              id="default-menu-category-title"
              className="text-sm font-bold leading-tight text-primary-main"
            >
              찾으시는 메뉴가 없다면?
            </h2>
            <DefaultMenuCategoryGrid
              categories={DEFAULT_MENU_CATEGORIES}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              className="mt-4"
            />
          </section>
        </div>
      </div>

      <div className="shrink-0 border-t border-main-light-gray-600 bg-white px-[22px] pb-3.5 pt-3 shadow-[0_-4px_16px_rgba(26,26,26,0.08)]">
        <Button
          htmlType="button"
          variant="solid"
          type="primary"
          radius="lg"
          disabled={!canRequestPairing}
          onClick={handleRequestPairing}
          className={cn(
            "h-[44px] w-full gap-2 rounded-xl text-[15px] font-bold text-white",
            canRequestPairing &&
              "bg-gradient-to-r from-[#d9a3ff] to-[#bd6cf3] shadow-[0_6px_14px_rgba(166,91,239,0.28)] hover:from-[#cf8cff] hover:to-[#ad55ea]"
          )}
        >
          <Sparkles className="h-4 w-4" strokeWidth={2.4} />
          와인 추천받기
        </Button>
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
      className="flex flex-col items-center justify-center gap-4 rounded-xl border border-main-light-gray-600 bg-white px-5 py-8 text-center"
    >
      {tone === "pending" ? (
        <LoadingSpinner label="추천 메뉴 불러오는 중" className="h-10 w-10" />
      ) : null}
      <p
        className={cn(
          "text-[15px] leading-relaxed",
          tone === "error" ? "text-error-main" : "text-text-02"
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
      className="h-11 gap-2 rounded-lg px-6 py-3 text-[14px] font-bold"
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
