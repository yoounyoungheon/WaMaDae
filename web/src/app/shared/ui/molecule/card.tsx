import * as React from "react";
import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from "../shadcn/card";
import { cn } from "@/app/utils/style/helper";

function Card({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"div">) {
  return (
    <ShadcnCard
      ref={ref}
      className={cn(
        "rounded-xl border border-slate-200 bg-white text-slate-950 shadow-lg",
        className
      )}
      {...props}
    />
  );
}
Card.displayName = "Card";

function CardHeader({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"div">) {
  return (
    <ShadcnCardHeader
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}
CardHeader.displayName = "CardHeader";

function CardTitle({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"h3">) {
  return (
    <ShadcnCardTitle
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}
CardTitle.displayName = "CardTitle";

function CardDescription({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"p">) {
  return (
    <ShadcnCardDescription
      ref={ref}
      className={cn("text-sm text-slate-500", className)}
      {...props}
    />
  );
}
CardDescription.displayName = "CardDescription";

function CardContent({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"div">) {
  return (
    <ShadcnCardContent
      ref={ref}
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  );
}
CardContent.displayName = "CardContent";

function CardFooter({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"div">) {
  return (
    <ShadcnCardFooter
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
