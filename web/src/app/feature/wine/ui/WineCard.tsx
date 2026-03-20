import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/app/shared/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";

export interface WineCardProps {
  id?: number;
  name: string;
  description: string;
  imageUrl: string;
  priceLabel: string;
  isSelected?: boolean;
  className?: string;
}

export default function WineCard({
  name,
  description,
  imageUrl,
  priceLabel,
  isSelected = false,
  className,
}: WineCardProps) {
  return (
    <Card
      className={cn(
        "h-32 w-full max-w-[420px] overflow-hidden transition-colors",
        isSelected
          ? "border-primary-main shadow-[0_0_0_2px_var(--tw-shadow-color)] shadow-primary-main/40"
          : "border-slate-200",
        className
      )}
    >
      <CardContent className="flex h-full items-stretch justify-between gap-3 p-2">
        <div className="h-full aspect-square rounded-lg bg-slate-100 p-2">
          <div className="relative h-full w-full overflow-hidden rounded-md">
            <Image
              src={imageUrl}
              alt={`${name} 와인 이미지`}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between py-1 pr-1">
          <CardTitle className="truncate text-base leading-5">{name}</CardTitle>
          <p className="line-clamp-2 text-sm text-slate-600">{description}</p>
          <p className="text-sm font-semibold text-slate-900">{priceLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}
