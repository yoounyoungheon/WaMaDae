import WineCard, { type WineCardProps } from "./WineCard";
import { cn } from "@/app/utils/style/helper";

export interface WineCardListProps {
  cards: WineCardProps[];
  direction?: "row" | "col";
  className?: string;
}

export default function WineCardList({
  cards,
  direction = "row",
  className,
}: WineCardListProps) {
  return (
    <section className={cn("w-full", className)}>
      <div
        className={cn(
          "flex gap-3",
          direction === "row"
            ? "overflow-x-auto pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "flex-col"
        )}
      >
        {cards.map((card, index) => (
          <div
            key={`${card.name}-${index}`}
            className={cn("shrink-0", direction === "row" ? "w-[280px]" : "w-full")}
          >
            <WineCard {...card} isSelected={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
