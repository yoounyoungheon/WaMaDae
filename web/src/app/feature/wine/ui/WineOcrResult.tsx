"use client";

import { useEffect, useMemo, useState } from "react";
import WineCard, { type WineCardProps } from "./WineCard";
import WineSearcher, {
  type WineSearcherCompletedPayload,
  type WineSearcherItem,
} from "./WineSearcher";
import { cn } from "@/app/utils/style/helper";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/app/shared/ui/molecule/dialog";
import { DialogClose } from "@radix-ui/react-dialog";

export interface WineOcrResultProps {
  cards: WineCardProps[];
  onSelect: (card: WineCardProps) => void;
  onDeSelect: (card: WineCardProps) => void;
  onAllSelect: (cards: WineCardProps[]) => void;
  onAllDeSelect: () => void;
  fetchWineSearch: (query: string) => Promise<WineSearcherItem[]>;
  onDirectAddCompleted?: (payload: WineSearcherCompletedPayload) => void;
  className?: string;
}

const getCardKey = (card: WineCardProps) =>
  `${card.name}-${card.priceLabel}-${card.imageUrl}`;

export default function WineOcrResult({
  cards,
  onSelect,
  onDeSelect,
  onAllSelect,
  onAllDeSelect,
  fetchWineSearch,
  onDirectAddCompleted,
  className,
}: WineOcrResultProps) {
  const [selectedCardList, setSelectedCardList] = useState<WineCardProps[]>([]);

  const cardKeySet = useMemo(
    () => new Set(cards.map((card) => getCardKey(card))),
    [cards]
  );

  useEffect(() => {
    setSelectedCardList((prev) =>
      prev.filter((selectedCard) => cardKeySet.has(getCardKey(selectedCard)))
    );
  }, [cardKeySet]);

  const selectedKeySet = useMemo(
    () => new Set(selectedCardList.map((card) => getCardKey(card))),
    [selectedCardList]
  );

  const handleToggle = (card: WineCardProps) => {
    const cardKey = getCardKey(card);
    const isSelected = selectedKeySet.has(cardKey);

    if (isSelected) {
      setSelectedCardList((prev) =>
        prev.filter((selectedCard) => getCardKey(selectedCard) !== cardKey)
      );
      onDeSelect(card);
      return;
    }

    setSelectedCardList((prev) => [...prev, card]);
    onSelect(card);
  };

  const handleAllSelect = () => {
    setSelectedCardList(cards);
    onAllSelect(cards);
  };

  const handleAllDeSelect = () => {
    setSelectedCardList([]);
    onAllDeSelect();
  };

  return (
    <section className={cn("grid grid-cols-3 gap-3", className)}>
      <div className="col-span-3 flex items-center justify-between">
        <p className="font-semibold text-slate-800">분석된 결과입니다.</p>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            className="text-slate-700 hover:text-slate-900"
            onClick={handleAllSelect}
          >
            모두 선택
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            className="text-slate-700 hover:text-slate-900"
            onClick={handleAllDeSelect}
          >
            모두 해제
          </button>
        </div>
      </div>

      <div className="col-span-3 grid grid-cols-1 gap-2">
        {cards.map((card, index) => {
          const isSelected = selectedKeySet.has(getCardKey(card));
          return (
            <button
              key={`${getCardKey(card)}-${index}`}
              type="button"
              className="w-full text-left"
              onClick={() => handleToggle(card)}
            >
              <WineCard {...card} isSelected={isSelected} />
            </button>
          );
        })}
      </div>

      <div className="col-span-3 flex items-center gap-2 text-sm">
        <span className="text-slate-700">찾는 와인이 없나요?</span>
        <ActionButton
          fetchWineSearch={fetchWineSearch}
          onCompleted={onDirectAddCompleted}
        />
      </div>
    </section>
  );
}

interface ActionButtonProps {
  fetchWineSearch: (query: string) => Promise<WineSearcherItem[]>;
  onCompleted?: (payload: WineSearcherCompletedPayload) => void;
}

const ActionButton = ({ fetchWineSearch, onCompleted }: ActionButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="font-medium text-primary-main">
          직접 추가하기
        </button>
      </DialogTrigger>
      <DialogContent className="bottom-0 left-0 right-0 top-auto h-[90%] w-full max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none data-[state=open]:animate-bottom-sheet-in data-[state=closed]:animate-bottom-sheet-out">
        <div className="flex h-full flex-col gap-3">
          <DialogClose>
            <div className="flex justify-end text-xs text-mysom-darkgray">
              닫기
            </div>
          </DialogClose>
          <div className="flex h-full justify-center overflow-y-auto p-3">
            <WineSearcher
              className="max-w-none"
              fetchWineSearch={fetchWineSearch}
              onCompleted={(payload) => {
                onCompleted?.(payload);
                setOpen(false);
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
