import Image from "next/image";
import { Card, CardContent } from "@/app/shared/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";

export interface WineRecommendCardProps {
  image?: string;
  rank?: number;
  title?: string;
  reason?: string;
  comment?: string;
  className?: string;
}

export default function WineRecommendCard({
  image = "",
  rank = 0,
  title = "",
  reason = "",
  comment = "",
  className,
}: WineRecommendCardProps) {
  return (
    <Card
      className={cn(
        "relative h-[280px] w-[280px] shrink-0 overflow-visible border-0 bg-transparent shadow-none",
        className,
      )}
    >
      <div className="absolute -left-8 -top-8 z-10 h-16 w-16 rounded-full border-2 border-violet-200 bg-white p-1 shadow-lg">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
          {image ? (
            <Image
              src={image}
              alt={`${title} 와인 이미지`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-violet-100" />
          )}
        </div>
      </div>

      <CardContent className="grid h-full grid-rows-[auto_auto_1fr_1fr] gap-4 rounded-[22px] bg-[linear-gradient(160deg,#6f2cc5_0%,#8e46df_55%,#c05cf3_100%)] px-4 pb-5 pt-7 text-white">
        <div>
          <span className="inline-flex rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-white backdrop-blur-sm">
            {rank}순위
          </span>
        </div>

        <h3 className="truncate text-lg font-extrabold leading-[1.2] tracking-[-0.03em]">
          {title}
        </h3>

        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-violet-100/90">
            추천 이유
          </p>
          <p className="line-clamp-2 text-sm leading-6 text-white/92">
            {reason}
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-violet-100/90">
            와마대 한줄평
          </p>
          <p className="line-clamp-2 text-sm leading-6 text-white/92">
            {comment}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
