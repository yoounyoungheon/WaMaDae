import { APIResponseType, checkResponseStatus, instance } from "@/app/utils/http";
import { API_PATH } from "@/app/utils/http/api-query";
import { createMeeting, Meeting } from "./meeting.domain";

export interface MeetingAPIResponseType {
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

export const loadMeetings = async (date: string): Promise<APIResponseType<Meeting[]>> => {
  try {
    const response = await instance.get(`${API_PATH}/meeting/date?startDate=${date}&endDate=${date}`);
    
    checkResponseStatus(response.status);

    const results: Meeting[] = response.data.map((meeting: MeetingAPIResponseType)=>{
      return createMeeting(meeting);
    })

    return {
      isSuccess: true,
      isFailure: false,
      data: results,
    }
  } catch (error) {
    return {
      isSuccess: false,
      isFailure: true,
      data: null,
      message: error instanceof Error ? error.message : String(error)
    }
  }
}