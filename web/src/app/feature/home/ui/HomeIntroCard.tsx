import * as React from "react";
import Link from "next/link";
import Button from "@/app/shared/ui/atom/button";
import { Card, CardContent } from "@/app/shared/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";

export interface HomeIntroCardProps {
  userName: string;
  actionIcon: React.ReactNode;
  actionHref: string;
  actionButtonLabel?: string;
  className?: string;
}

export default function HomeIntroCard({
  userName,
  actionIcon,
  actionHref,
  actionButtonLabel = "음식점 추천 버튼",
  className,
}: HomeIntroCardProps) {
  return (
    <Card className={cn("border-none shadow-none", className)}>
      <CardContent className="flex flex-col gap-6 p-3">
        <section className="whitespace-pre-line text-lg font-semibold leading-snug text-slate-900">
          {`${userName}님\n오늘은 어떤 와인을 드실건가요?`}
        </section>

        <section className="grid grid-cols-10 items-center gap-3">
          <div className="col-span-8 text-sm leading-5 text-slate-600">
            <p className="text-primary-main">지금 음식점이신가요?</p>
            <p>버튼을 눌러 음식과 어울리는 와인을 추천받으세요!</p>
          </div>

          <div className="col-span-2 flex justify-end">
            <Button
              asChild
              size="icon"
              radius="full"
              variant="solid"
              type="primary"
            >
              <Link href={actionHref} aria-label={actionButtonLabel}>
                {actionIcon}
              </Link>
            </Button>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
