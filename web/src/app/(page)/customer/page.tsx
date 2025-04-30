import { Meeting } from "@/app/business/meeting/meeting.domain";
import { loadMeetings } from "@/app/business/meeting/meeting.service";
import Button from "@/app/ui/atom/button";
import { MeetingView } from "@/app/ui/component/customer/meeting-view";
import { cn } from "@/app/utils/style/helper";
import Link from "next/link";
import Image from "next/image";
import Cattot1 from "@/app/assets/carrot1.png"
// import Cattot2 from "@/app/assets/carrot2.jpeg"
// import Cattot4 from "@/app/assets/carrot4.jpeg"
// import Cattot5 from "@/app/assets/carrot5.jpeg"
// import Cattot6 from "@/app/assets/carrot6.jpeg"
// import Cattot7 from "@/app/assets/carrot7.jpeg"


export default async function CustomerHome({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const current = searchParams.current;
  let meetings: Meeting[] | null = null
  const loadMeetingsResponse = await loadMeetings();

  if(loadMeetingsResponse.isSuccess && loadMeetingsResponse.data){
    meetings = loadMeetingsResponse.data.filter((meeting)=>{return meeting.sort==current});
  }
  // const carrots = [Cattot1.src, Cattot2.src, Cattot4.src, Cattot5.src, Cattot6.src, Cattot7.src];
  return (
    <main>
      <div className="relative w-full aspect-square mb-4">
        <Image src={Cattot1.src} alt={""} fill className="rounded-lg object-cover"/>
      </div>
      <div className="px-10 mt-5 mb-5">
        <div className="py-5 grid grid-cols-3 gap-3">
          <Link href={"/customer?current=club"}>
            <Button className={cn('w-full', current==='club'?``:'bg-white text-slate-700 hover:bg-slate-100 ')}>
              정기모임
            </Button>
          </Link>
          
          <Link href={"/customer?current=class"}>
            <Button className={cn('w-full', current==='class'?``:'bg-white text-slate-700 hover:bg-slate-100 ')}>
              클래스
            </Button>
          </Link>

          <Link href={"/customer/my-book"}>
            <Button className={cn('w-full bg-white text-slate-700')}>
              나의 예약
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-7">
          {meetings?.map((meeting, index)=>{
            return (
              <MeetingView key={index} meeting={meeting}/>
            )
          })}
        </div>
      </div>
    </main>
  );
}
