import Image from "next/image";
import Link from "next/link";
import { Card } from "@/app/shared/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";

export interface WineHistoryItem {
  id: string | number;
  name: string;
  image?: string;
  iamge?: string;
}

export interface WineHistorySectionProps {
  wineList: WineHistoryItem[];
  getWineHref?: (wine: WineHistoryItem) => string;
  className?: string;
}

export default function WineHistorySection({
  wineList,
  getWineHref,
  className,
}: WineHistorySectionProps) {
  return (
    <section className={cn("w-full", className)}>
      <div className="flex flex-row flex-nowrap gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {wineList.map((wine) => {
          const imageSrc = wine.image ?? wine.iamge ?? "";
          const href = getWineHref?.(wine);

          const content = (
            <div className="w-36 min-w-36 max-w-36 basis-36 shrink-0">
              <Card className="relative w-full aspect-[4/6] overflow-hidden border-slate-200 shadow-none">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={`${wine.name} 이미지`}
                    fill
                    className="object-cover object-center"
                    sizes="144px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-500">
                    이미지 없음
                  </div>
                )}
              </Card>
              <p className="mt-2 truncate text-sm font-medium text-slate-800">
                {wine.name}
              </p>
            </div>
          );

          if (href) {
            return (
              <Link
                key={wine.id}
                href={href}
                className="shrink-0"
                aria-label={`${wine.name} 상세로 이동`}
              >
                {content}
              </Link>
            );
          }

          return (
            <div key={wine.id} className="shrink-0">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
