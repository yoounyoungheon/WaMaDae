import type { Metadata } from "next";
import BetaAccessForm from "@/app/feature/beta-access/ui/BetaAccessForm";

export const metadata: Metadata = {
  title: "베타 접근 | 마이쏨",
};

export default function BetaAccessPage() {
  return (
    <main className="flex h-full items-center justify-center overflow-y-auto bg-canvas bg-violet-haze px-5 py-8 text-ink-page">
      <BetaAccessForm />
    </main>
  );
}
