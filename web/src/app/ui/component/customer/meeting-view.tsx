import { Meeting } from "@/app/business/meeting/meeting.domain";
import { Card, CardTitle } from "../../molecule/card";
import Link from "next/link";

interface MeetingViewProps {
  meeting: Meeting
}

export function MeetingView({meeting}:MeetingViewProps){

  return (
    <Link href={`/customer/book?meetingId=${meeting.id}`}>
      <Card
      className="relative p-3 border-none shadow-lg rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
      style={{ backgroundImage: `url(${meeting.imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent z-0" />
      <div className="relative z-10">
        <CardTitle className="text-lg font-bold text-white">
          {meeting.meetingName}
        </CardTitle>
        <div className="p-10" />
        <div className="mt-auto inline-block text-white text-sm">
          {`자세히 보기 >`}
        </div>
      </div>
      </Card>
    </Link>
  )
}