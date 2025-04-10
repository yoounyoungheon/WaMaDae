import { Meeting } from "@/app/business/meeting/meeting.domain";
import { loadMeetingsForManager } from "@/app/business/meeting/meeting.service";
import { MeetingsInfoView } from "@/app/ui/component/manager/meetingsInfo";
import { MonthCalendar } from "@/app/ui/component/manager/month-calendar";
import { APIResponseType } from "@/app/utils/http";


export default async function ManagerHome({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const date = searchParams.date;
  const isNextMonth = searchParams.isNextMonth;
  let loadMeetingsResponse: APIResponseType<Meeting[]> | null = null;
  if(date){
    loadMeetingsResponse = await loadMeetingsForManager(date);
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  return (
    <main>
      <div className="p-10 grid grid-cols-[5fr_3fr] gap-10">
        <MonthCalendar year={currentYear} month={isNextMonth==='true'?currentMonth+1:currentMonth}/>
        {<MeetingsInfoView meetings={loadMeetingsResponse?.data as Meeting[]}/>}
      </div>
    </main>
  );
}
