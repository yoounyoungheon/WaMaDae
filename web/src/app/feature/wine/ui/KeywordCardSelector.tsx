"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Button from "@/app/shared/ui/atom/button";
import { Card, CardContent } from "@/app/shared/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";

export interface KeywordCardSelectorProps {
  keywords: string[];
  wines?: string[];
  nextButtonLabel?: string;
  className?: string;
}

export default function KeywordCardSelector({
  keywords,
  wines = [],
  nextButtonLabel = "다음",
  className,
}: KeywordCardSelectorProps) {
  const router = useRouter();
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const selectedKeywordSet = useMemo(
    () => new Set(selectedKeywords),
    [selectedKeywords],
  );

  const handleToggle = (keyword: string) => {
    const isSelected = selectedKeywordSet.has(keyword);

    if (isSelected) {
      setSelectedKeywords((prev) => prev.filter((item) => item !== keyword));
      return;
    }

    setSelectedKeywords((prev) => [...prev, keyword]);
  };

  const handleNext = () => {
    if (selectedKeywords.length === 0) return;

    const searchParams = new URLSearchParams();

    selectedKeywords.forEach((keyword) => {
      searchParams.append("keyword", keyword);
    });

    wines.forEach((wine) => {
      searchParams.append("wine", wine);
    });

    router.push(`/main/chat?${searchParams.toString()}`);
  };

  return (
    <section className={cn("flex flex-col gap-6", className)}>
      <div className="grid grid-cols-2 gap-3">
        {keywords.map((keyword) => {
          const isSelected = selectedKeywordSet.has(keyword);

          return (
            <button
              key={keyword}
              type="button"
              className="w-full text-left"
              onClick={() => handleToggle(keyword)}
            >
              <Card
                className={cn(
                  "transition-colors",
                  isSelected
                    ? "border-primary-main shadow-[0_0_0_2px_var(--tw-shadow-color)] shadow-primary-main/40"
                    : "border-slate-200",
                )}
              >
                <CardContent className="flex min-h-20 items-center justify-center p-4">
                  <p className="text-center text-sm font-semibold text-slate-900">
                    {keyword}
                  </p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <Button
        className="w-full"
        disabled={selectedKeywords.length === 0}
        onClick={handleNext}
      >
        {nextButtonLabel}
      </Button>
    </section>
  );
}
