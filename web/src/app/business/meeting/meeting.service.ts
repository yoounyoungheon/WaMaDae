'use server'
import { APIResponseType, checkResponseStatus, instance } from "@/app/utils/http";
import { API_PATH } from "@/app/utils/http/api-query";
import { createMeeting, Meeting } from "./meeting.domain";
import { CreateMeetingReqestDto, MeetingAPIResponseDto } from "./meeting.dto";
import { FormState } from "@/app/utils/type/type";

export const createMeetingReqest = async (prevState: FormState ,formDate: FormData): Promise<FormState> => {
  const sort = formDate.get("sort") as string;
  const meetingName = formDate.get("meetingName") as string;
  const description = formDate.get("description") as string;
  const place = formDate.get("place") as string;
  const fee = formDate.get("fee") as string;
  const date = formDate.get("date") as string;
  const imgUrl = formDate.get("imgUrl") as string;
  const startTime = formDate.get("startTime") as string;
  const endTime = formDate.get("endTime") as string;

  const dto: CreateMeetingReqestDto = {
    sort, description, meetingName, place, fee: parseInt(fee), date: new Date(date), imgUrl, startTime, endTime
  }
  try {
    const response = await instance.post(`${API_PATH}/meeting`, dto);

    checkResponseStatus(response.status);

    return {
      isSuccess: true,
      isFailure: false,
      validationError: {},
      message: "모임 생성 성공",
    }
  } catch (error) {
    return {
      isSuccess: false,
      isFailure: true,
      validationError: {},
      message: error instanceof Error ? error.message : String(error)
    }
  }
}

export const loadMeeting = async (id: string): Promise<APIResponseType<Meeting>> => {
  try {
    const response = await instance.get(`${API_PATH}/meeting/${id}`);
    checkResponseStatus(response.status);

    const responseDate:MeetingAPIResponseDto = response.data
    const meeting: Meeting = createMeeting(responseDate);
    return {
      isSuccess: true,
      isFailure: false,
      data: meeting
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
export const loadMeetings = async (): Promise<APIResponseType<Meeting[]>> => {
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    const response = await instance.get(`${API_PATH}/meeting/date?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);

    checkResponseStatus(response.status);

    const results: Meeting[] = response.data.map((meeting: MeetingAPIResponseDto)=>{
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

export const loadMeetingsForManager = async (date: string): Promise<APIResponseType<Meeting[]>> => {
  try {
    
    const response = await instance.get(`${API_PATH}/meeting/date?startDate=${date}&endDate=${date}`);

    checkResponseStatus(response.status);

    const results: Meeting[] = response.data.map((meeting: MeetingAPIResponseDto)=>{
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