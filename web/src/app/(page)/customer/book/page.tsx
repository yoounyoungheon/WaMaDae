import ExampleImage from "@/app/assets/ExampleImage.png"
import { Meeting } from "@/app/business/meeting/meeting.domain";
import { loadMeeting } from "@/app/business/meeting/meeting.service";
import { BookFormView } from "@/app/ui/component/customer/book-form-view";
import { MeetingDetailView } from "@/app/ui/component/customer/meeting-detail-view";
import Image from "next/image"
export default async function BookPage({
    searchParams,
  }: {
    searchParams: { [key: string]: string | undefined };
  }){
  const meetingId = searchParams.meetingId;
  let meeting: Meeting | null = null;
  if(meetingId){
    const loadMeetingResponse = await loadMeeting(meetingId);
    if(loadMeetingResponse.isSuccess && loadMeetingResponse.data){
     meeting = loadMeetingResponse.data;
    }
  }

  return (
  <main>
    <div className="relative w-full aspect-[5/5] mb-4">
      <Image src={ExampleImage.src} alt={""} fill className="object-cover"/>
    </div>
    <div className="p-3 px-7">
      <div className="text-2xl text-start font-bold mb-5">{meeting?.meetingName}</div>
      <hr/>
      <div className="p-6">
        {meeting&&<MeetingDetailView meeting={meeting}/>}
      </div>
      <hr/>
      <div className="p-6">
        {meeting&&<BookFormView meeting={meeting}/>}
      </div>
    </div>
  </main>
  )
}