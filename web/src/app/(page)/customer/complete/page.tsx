import Button from "@/app/ui/atom/button";
import { Card } from "@/app/ui/molecule/card";
import Link from "next/link";

export default function CompletePage() {
  return (
    <main className="px-10 text-center grid grid-cols-1 gap-10 mb-10 mt-20">
      <div>아래 계좌로 참가비용을 입금하면 신청이 완료됩니다. 감사합니다!</div>
      <Card className="text-white bg-sky-700 p-3 space-x-3">
        <span className="font-semibold">신한 </span>
        <span>110-353-009154</span>
        <span>박상현</span>
      </Card>
      <div>
        <Link href={"/customer?current=club"}>
          <Button variant={'outline'}>확인</Button>
        </Link>
      </div>
    </main>
  )
}