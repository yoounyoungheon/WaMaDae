export interface Meeting {
  id: string;
  managerId: string;
  sort: string;
  meetingName: string;
  description: string;
  place: string;
  fee: number;
  date: Date;
  imgUrl: string;
  startTime: string;
  endTime: string;
}

export interface Meeting {
  id: string;
  managerId: string;
  sort: string;
  meetingName: string;
  description: string;
  place: string;
  fee: number;
  date: Date;
  imgUrl: string;
  startTime: string;
  endTime: string;
}

export function createMeeting({
  id,
  managerId,
  sort,
  meetingName,
  description,
  place,
  fee,
  date,
  imgUrl,
  startTime,
  endTime,
}: {
  id: string;
  managerId: string;
  sort: string;
  meetingName: string;
  description: string;
  place: string;
  fee: string;
  date: string;
  imgUrl?: string;
  startTime: string;
  endTime: string;
}): Meeting {
  return {
    id: id,
    managerId,
    sort,
    meetingName,
    description,
    place,
    fee: parseFloat(fee),
    date: new Date(date),
    imgUrl: imgUrl || '',
    startTime,
    endTime,
  } as Meeting;
}
