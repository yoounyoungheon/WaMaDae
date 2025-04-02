export interface CreateMeetingReqestDto {
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

export interface MeetingAPIResponseDto {
  id: string;
  managerId: string;
  sort: string;
  meetingName: string;
  description: string;
  place: string;
  fee: string;
  date: string;
  imgUrl: string;
  startTime: string;
  endTime: string;
}