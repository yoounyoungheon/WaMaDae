import { DateInfo, DayType } from "../type/type";

export function convertDateCodeToString(dateCode: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dateCode];
}

export function calculateDateCount(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function convertMonthToDateInfos(year: number, month: number): DateInfo[] {
  const dateCount = calculateDateCount(year, month);
  const dateInfos: DateInfo[] = [];

  for (let date = 1; date <= dateCount; date++) {
    const currentDate = new Date(year, month - 1, date);
    const day = currentDate.toLocaleString('en-US', { weekday: 'short' }) as DayType;
    
    dateInfos.push({
      day,
      date,
      month,
      year,
    });
  }

  return dateInfos;
}