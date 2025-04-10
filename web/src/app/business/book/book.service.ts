'use server'
import { APIResponseType, checkResponseStatus, instance } from "@/app/utils/http"
import { API_PATH } from "@/app/utils/http/api-query"

export const createBookRequest = async(
  meetingId: string,
  name: string, 
  nickname: string,
  phoneNumber: string):Promise<APIResponseType<string>> => {
  try {
    const response = await instance.post(`${API_PATH}/book/${meetingId}`, {name, nickname, phoneNumber})
    checkResponseStatus(response.status);

    return {
      isSuccess: true,
      isFailure: false,
      data: response.data.id
    }
  } catch(error){
    return {
      isSuccess: false,
      isFailure: true,
      data: null,
      message: error instanceof Error ? error.message : String(error)
    }
  }
}