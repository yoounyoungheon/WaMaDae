import { Meeting } from "@/app/business/meeting/meeting.domain";
import { Card, CardTitle } from "../../molecule/card";
import Link from "next/link";
import Image from "next/image";
import { convertDateCodeToString } from "./meeting-detail-view";

interface MeetingViewProps {
  meeting: Meeting;
}

export function MeetingView({ meeting }: MeetingViewProps) {
  return (
    <Link href={`/customer/book?meetingId=${meeting.id}`}>
      <Card className="relative p-3 border-none shadow-lg rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
        <Image
          src={meeting.imgUrl}
          alt={meeting.meetingName}
          fill
          className="object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent z-10" />
        <div className="relative z-20">
          <CardTitle className="text-lg font-bold text-white">
            {`${meeting.meetingName}`}
          </CardTitle>
          <div className="py-2 text-white">{`${meeting.date.getFullYear()}.${meeting.date.getMonth()+1}.${meeting.date.getDate()} (${convertDateCodeToString(meeting.date.getDay())})`}</div>
          <div className="p-7" />
          <div className="mt-auto inline-block text-white text-sm">
            자세히 보기 &gt;
          </div>
        </div>
      </Card>
    </Link>
  );
}
