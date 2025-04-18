import { useMemo } from "react";
import { Card, CardContent, CardTitle } from "../../molecule/card";
import Link from "next/link";
import { DateInfo, DayType } from "@/app/utils/type/type";
import { convertMonthToDateInfos } from "@/app/utils/converter/converter";

export function MonthCalendar({ year, month }: { year: number; month: number; }) {
  const dateInfos: DateInfo[] = calculateMonthCalendarDatesInfo(year, month);
  const days: DayType[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const today = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      date: now.getDate(),
    };
  }, []);

  return (
    <main>
      <Card>
        <CardTitle className="mt-5 mb-5 grid grid-cols-3 text-center text-xl">
          <Link className="text-sm p-1" href={`/manager?isNextMonth=false`}>
            {`prev `}
          </Link>

          {`${year}. ${month}`}
          
          <Link className="text-sm p-1" href={`/manager?isNextMonth=true`}>
            {` next`}
          </Link>
        </CardTitle>

        <hr/>
        
        <CardContent className="mt-3">
          <div className="grid grid-cols-7 gap-3">

            {days.map((day, index) => {
              return (
                <div key={index} className="text-center font-semibold">
                  {day}
                </div>
              );
            })}

            {dateInfos.map((dateInfo, index) => {
            const paddedMonth = String(dateInfo.month).padStart(2, '0');
            const paddedDate = String(dateInfo.date).padStart(2, '0');
            const isPastDate =
              dateInfo.year < today.year ||
              (dateInfo.year === today.year && dateInfo.month < today.month) ||
              (dateInfo.year === today.year && dateInfo.month === today.month && dateInfo.date < today.date);

            const isNextMonth = dateInfo.year === today.year && dateInfo.month === today.month + 1;
            const linkHref = `?date=${dateInfo.year}-${paddedMonth}-${paddedDate}${isNextMonth ? '&isNextMonth=true' : ''}`;

            return (
              <Card key={index} className="aspect-square flex items-center justify-center">
                <div className={`text-center ${isPastDate ? 'text-gray-400 cursor-not-allowed' : ''}`}>
                  {dateInfo.date !== 0 ? (
                    isPastDate ? (
                      <span>{dateInfo.date}</span>
                    ) : (
                      <Link href={linkHref}>
                        {dateInfo.date}
                      </Link>
                    )
                  ) : (
                    ''
                  )}
                </div>
              </Card>
            );
            })}

          </div>
        </CardContent>
      </Card>
    </main>
  );
}

const calculateMonthCalendarDatesInfo = (year: number, month: number): DateInfo[] => {
  const dateInfos: DateInfo[] = convertMonthToDateInfos(year, month);

  switch (dateInfos[0].day) {
    case 'Tue':
      dateInfos.unshift({ day: 'Mon', date: 0, month: 0, year: 0 });
      break;
    case 'Wed':
      dateInfos.unshift({ day: 'Tue', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Mon', date: 0, month: 0, year: 0 });
      break;
    case 'Thu':
      dateInfos.unshift({ day: 'Wed', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Tue', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Mon', date: 0, month: 0, year: 0 });
      break;
    case 'Fri':
      dateInfos.unshift({ day: 'Thu', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Wed', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Tue', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Mon', date: 0, month: 0, year: 0 });
      break;
    case 'Sat':
      dateInfos.unshift({ day: 'Fri', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Thu', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Wed', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Tue', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Mon', date: 0, month: 0, year: 0 });
      break;
    case 'Sun':
      dateInfos.unshift({ day: 'Sat', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Fri', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Thu', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Wed', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Tue', date: 0, month: 0, year: 0 });
      dateInfos.unshift({ day: 'Mon', date: 0, month: 0, year: 0 });
      break;
  }
  return dateInfos;
};