import WineCard, { type WineCardProps } from "./WineCard";
import { cn } from "@/app/utils/style/helper";

export interface WineRecommendSectionProps {
  cards: WineCardProps[];
  className?: string;
}

export default function WineRecommendSection({
  cards,
  className,
}: WineRecommendSectionProps) {
  return (
    <section className={cn("w-full", className)}>
      <div className="flex gap-3 overflow-x-auto pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((card, index) => (
          <div key={`${card.name}-${index}`} className="w-[280px] shrink-0">
            <WineCard {...card} isSelected={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
