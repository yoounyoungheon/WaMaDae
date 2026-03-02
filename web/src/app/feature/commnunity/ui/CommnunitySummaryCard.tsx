import Image from "next/image";
import { Card, CardTitle } from "@/app/shared/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";

export interface CommnunitySummaryCardProps {
  title: string;
  description: string;
  likeCount: number;
  commentCount: number;
  imageUrl?: string;
  className?: string;
}

export default function CommnunitySummaryCard({
  title,
  description,
  likeCount,
  commentCount,
  imageUrl,
  className,
}: CommnunitySummaryCardProps) {
  return (
    <Card className={cn("h-24 w-full overflow-hidden shadow-none", className)}>
      <div className="h-full grid grid-cols-[8fr_2fr] gap-2 p-3">
        <div
          className={cn(
            "grid min-h-0 h-full grid-rows-3 gap-2",
            !imageUrl && "col-span-2"
          )}
        >
          <CardTitle className="truncate text-base leading-5">
            {title}
          </CardTitle>

          <p className="truncate text-sm leading-5 text-slate-600">
            {description}
          </p>

          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <span>좋아요 {likeCount}</span>
            <span>댓글 {commentCount}</span>
          </div>
        </div>

        {imageUrl ? (
          <div className="flex min-h-0 h-full items-end justify-end">
            <div className="aspect-square h-full overflow-hidden rounded-md bg-slate-100">
              <Image
                src={imageUrl}
                alt={title}
                width={320}
                height={320}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
