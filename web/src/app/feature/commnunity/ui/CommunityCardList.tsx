import CommnunitySummaryCard, {
  type CommnunitySummaryCardProps as CommnunitySummaryCardProp,
} from "./CommnunitySummaryCard";
import { cn } from "@/app/utils/style/helper";

export interface CommunityCardListProps {
  cards: CommnunitySummaryCardProp[];
  className?: string;
}

export default function CommunityCardList({
  cards,
  className,
}: CommunityCardListProps) {
  return (
    <section className={cn("grid w-full grid-cols-1 gap-2", className)}>
      {cards.map((card, index) => (
        <CommnunitySummaryCard
          key={`${card.title}-${card.commentCount}-${index}`}
          {...card}
        />
      ))}
    </section>
  );
}
