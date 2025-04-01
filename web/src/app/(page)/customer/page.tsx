import Button from "@/app/ui/atom/button";
import { Card } from "@/app/ui/molecule/card";
import Link from "next/link";


export default function CustomerHome({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const current = searchParams.current;
  return (
    <main className="px-10 mt-5">
      <div className="py-5 grid grid-cols-2 gap-3">
        
        <Button className={current==='club'?``:'bg-white text-slate-700 hover:bg-slate-100'}>
          <Link href={"/customer?current=club"}>정기모임</Link>
        </Button>
        
        
        <Button className={current==='class'?``:'bg-white text-slate-700 hover:bg-slate-100 '}>
          <Link href={"/customer?current=class"}>정기모임</Link>
        </Button>
        
      </div>
      <div className="grid grid-cols-1 gap-5">
        <Card className="p-10 text-center">로고</Card>
        <Card className="p-10 text-center">로고</Card>
        <Card className="p-10 text-center">로고</Card>
        <Card className="p-10 text-center">로고</Card>
      </div>
    </main>
  );
}
