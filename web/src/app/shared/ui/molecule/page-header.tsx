import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/app/utils/style/helper";

export interface PageHeaderProps {
  title: string;
  routeBackPath?: string;
  className?: string;
}

export default function PageHeader({
  title,
  routeBackPath,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-[50px] shrink-0 items-center border-b border-main-light-gray-600 bg-white px-4",
        className
      )}
    >
      {routeBackPath ? (
        <Link
          href={routeBackPath}
          aria-label="뒤로가기"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-02 transition-colors hover:bg-main-light-gray-300"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
        </Link>
      ) : null}
      <h1
        className={cn(
          "truncate text-[20px] font-bold leading-none text-text-02",
          routeBackPath && "ml-2"
        )}
      >
        {title}
      </h1>
    </header>
  );
}
