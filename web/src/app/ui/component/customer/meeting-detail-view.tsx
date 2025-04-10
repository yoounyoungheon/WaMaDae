import { Meeting } from "@/app/business/meeting/meeting.domain";

interface MeetingDetailViewProps {
  meeting: Meeting
}
export function MeetingDetailView({meeting}:MeetingDetailViewProps){
  const { startTime, endTime, date, place, fee, description} = meeting

  return (
    <main>
      <div className="text-start space-y-3">
        <div className="space-x-5">
          <span className="font-semibold text-sky-700">일시</span>
          <span>{`${date.toLocaleString().substring(0,11)} (${convertDateCodeToString(date.getDay())}요일) ${startTime}~${endTime}`}</span>
        </div>
        <div className="space-x-5">
          <span className="font-semibold text-sky-700">장소</span>
          <span>{`${place}`}</span>
        </div>
        <div className="space-x-5">
          <span className="font-semibold text-sky-700">비용</span>
          <span>{`${fee.toLocaleString()} 원`}</span>
        </div>
        <div className="text-sm text-gray-500">
          {description}
        </div>
      </div>
    </main>
  )
}

export function convertDateCodeToString(dateCode: number): string {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    return days[dateCode];
  }