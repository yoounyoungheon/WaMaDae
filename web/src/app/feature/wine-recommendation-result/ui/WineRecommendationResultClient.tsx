"use client";

import { useState } from "react";
import type { FollowUpQuestion } from "@/app/entity/wine-recommendation/model/wine-recommendation.type";
import { cn } from "@/app/utils/style/helper";
import FloatingChatButton from "./FloatingChatButton";
import FollowUpQuestionSection from "./FollowUpQuestionSection";
import WineRecommendationCarousel from "./WineRecommendationCarousel";
import WineRecommendationChatDialog from "./WineRecommendationChatDialog";
import type { WineRecommendationResultClientProps } from "./wine-recommendation-result.props";

export default function WineRecommendationResultClient({
  result,
  className,
}: WineRecommendationResultClientProps) {
  const [currentWineIndex, setCurrentWineIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInputValue, setChatInputValue] = useState("");
  const [selectedQuestionLabel, setSelectedQuestionLabel] = useState<
    string | undefined
  >();

  const wineCount = result.wines.length;

  const handlePrevious = () => {
    if (wineCount === 0) {
      return;
    }

    setCurrentWineIndex((index) => (index - 1 + wineCount) % wineCount);
  };

  const handleNext = () => {
    if (wineCount === 0) {
      return;
    }

    setCurrentWineIndex((index) => (index + 1) % wineCount);
  };

  const handleQuestionClick = (question: FollowUpQuestion) => {
    setSelectedQuestionLabel(question.label);
    setChatInputValue(question.label);
    setIsChatOpen(true);
  };

  const handleChatButtonClick = () => {
    setSelectedQuestionLabel(undefined);
    setIsChatOpen(true);
  };

  const handleSubmit = (message: string) => {
    console.log(message);
  };

  return (
    <div className={cn("min-w-0", className)}>
      <WineRecommendationCarousel
        wines={result.wines}
        currentIndex={currentWineIndex}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      <FollowUpQuestionSection
        className="mt-7"
        questions={result.followUpQuestions}
        onQuestionClick={handleQuestionClick}
      />

      <FloatingChatButton onClick={handleChatButtonClick} />

      <WineRecommendationChatDialog
        open={isChatOpen}
        inputValue={chatInputValue}
        chat={result.chat}
        selectedQuestionLabel={selectedQuestionLabel}
        onOpenChange={setIsChatOpen}
        onInputChange={setChatInputValue}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
