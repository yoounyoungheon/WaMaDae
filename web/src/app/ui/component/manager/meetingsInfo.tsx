import { Meeting } from "@/app/business/meeting/meeting.domain"
import { Card, CardContent } from "../../molecule/card"
import Button from "../../atom/button";
import { CreateMeetingDialog } from "./create-meeting-dialog";
interface MeetingInfoProps {
  meetings: Meeting[] | undefined;
}
export const MeetingsInfoView = ({meetings}:MeetingInfoProps) => {
  const views: JSX.Element[] | undefined = meetings?.map((meeting, index) => {
    return (
      <main className="p-5" key={index}>
        <MeetingInfoView meeting={meeting} />
        <hr/>
      </main>
    )
  })
  return (

    <Card className="">
      <div className="grid grid-cols-1 gap-3 overflow-y-auto">
        {views}
      </div>
      <div className="text-right p-5">
        <CreateMeetingDialog/>
      </div>
    </Card>
  )
}

const MeetingInfoView = ({meeting}: {meeting: Meeting}) => {
  const { meetingName, sort, description, place, fee, date, imgUrl, startTime, endTime } = meeting;
  return (
    <CardContent className="p-5 grid grid-cols-1 gap-4 bg-gray-50 rounded-lg shadow-md">
    <div className="text-lg font-semibold text-gray-800">
        {`${meetingName} (${sort})`}
    </div>
    <div className="text-sm text-gray-600">
        <span className="font-medium text-gray-700">날짜:</span> {date.toLocaleDateString()}
    </div>
    <div className="text-sm text-gray-600">
        <span className="font-medium text-gray-700">설명:</span> {description}
    </div>
    <div className="text-sm text-gray-600">
        <span className="font-medium text-gray-700">참가비:</span> {`${fee.toLocaleString()} 원`}
    </div>
    <div className="text-sm text-gray-600">
        <span className="font-medium text-gray-700">장소:</span> {place}
    </div>
    {imgUrl && (
        <div className="text-sm text-gray-600">
          {imgUrl}
        </div>
    )}
    <div className="text-sm text-gray-600">
        <span className="font-medium text-gray-700">시간:</span> {`${startTime} ~ ${endTime}`}
    </div>
    <div className="text-right">
      <Button>수정</Button>
    </div>
    </CardContent>
  )
}