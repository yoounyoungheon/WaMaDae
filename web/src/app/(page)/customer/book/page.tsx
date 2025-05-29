import { Book } from "@/app/business/book/book.domain";
import { loadBooksByMeetingId } from "@/app/business/book/book.service";
import { Meeting } from "@/app/business/meeting/meeting.domain";
import { loadMeeting } from "@/app/business/meeting/meeting.service";
import { BookFormView } from "@/app/ui/component/customer/book-form-view";
import { BookListView } from "@/app/ui/component/customer/book-list.view";
import { MeetingDetailView } from "@/app/ui/component/customer/meeting-detail-view";
import Image from "next/image"
import Link from "next/link";
export default async function BookPage({
    searchParams,
  }: {
    searchParams: { [key: string]: string | undefined };
  }){
  const meetingId = searchParams.meetingId;
  const list = searchParams.list;
  let meeting: Meeting | null = null;
  let books: Book[] = [];
  if(meetingId){
    const loadMeetingResponse = await loadMeeting(meetingId);
    if(loadMeetingResponse.isSuccess && loadMeetingResponse.data){
     meeting = loadMeetingResponse.data;
    }

    const loadBooksReponse = await loadBooksByMeetingId(meetingId);
    if(loadBooksReponse.isSuccess && loadBooksReponse.data){
      books = loadBooksReponse.data
    }
  }

  return (
  <main>
    <div className="relative w-full aspect-[5/5] mb-4">
      <Image src={meeting?.imgUrl as string} alt={""} fill className="object-cover"/>
    </div>
    <div className="p-3 px-7">
      <div className="text-2xl text-start font-bold mb-5">{meeting?.meetingName}</div>
      <hr/>
      <div className="p-6">
        {meeting&&<MeetingDetailView meeting={meeting}/>}
      </div>
      <hr/>
      <div className="mt-3 px-6 flex space-x-3 text-sm text-sky-800">
        <span><Link href={`/customer/book?meetingId=${meetingId}`}>예약하기</Link></span>
        <span><Link href={`/customer/book?meetingId=${meetingId}&list=${true}`}>예약현황</Link></span>
      </div>
      <div className="p-6">
        {(meeting&&list!=='true')&&<BookFormView meeting={meeting}/>}
        {(meeting&&list==='true')&&<BookListView books={books}/>}
      </div>
    </div>
  </main>
  )
}