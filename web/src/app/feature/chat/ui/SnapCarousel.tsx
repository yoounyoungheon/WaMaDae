"use client";

import { Card } from "@/app/shared/ui/molecule/card";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

type Item = {
  title: string;
  desc?: string;
  img: string;
};

const FALLBACK_ITEM: Item = { title: "레드", img: "/carrot1.png" };

export default function SnapCarousel({ items }: { items: Item[] }) {
  const [selectedItem, setSelectedItem] = useState<Item>(
    items.at(0) ?? FALLBACK_ITEM
  );

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="py-3 pl-1 flex flex-row flex-nowrap gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => (
          <Card
            key={index}
            className={clsx("shrink-0 border", "shadow-none")}
            onClick={() => setSelectedItem(item)}
          >
            <div className="relative w-16 aspect-square">
              <Image
                src={item.img}
                alt={item.img}
                fill
                className="object-cover rounded-xl"
                sizes="96px"
              />
              <div
                className={clsx(
                  "pointer-events-none absolute inset-0 rounded-xl",
                  item.title === selectedItem.title
                    ? "bg-gradient-to-t from-mysom-primary/80 via-mysom-lightpurple/20 to-transparent"
                    : "bg-gray-700/65"
                )}
              />
              <div
                className={
                  "pointer-events-none absolute inset-0 flex items-center justify-center px-1 text-center text-xs text-white truncate"
                }
              >
                {item.title}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-3 flex justify-center items-center h-24">
          {`${selectedItem.title}에 대한 설명~`}
        </div>
      </Card>
    </div>
  );
}
