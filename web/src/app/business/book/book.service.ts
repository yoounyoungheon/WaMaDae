'use server'
import { APIResponseType, checkResponseStatus, instance } from "@/app/utils/http"
import { API_PATH } from "@/app/utils/http/api-query"
import { Book } from "./book.domain"

export const loadBooksByMeetingId = async (meetingId: string):Promise<APIResponseType<Book[]>> => {
  try {
    const response = await instance.get(`${API_PATH}/book/project/${meetingId}`);
    checkResponseStatus(response.status);

    return {
      isSuccess: true,
      isFailure:  false,
      data: response.data,
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

export const loadBook = async (id: string):Promise<APIResponseType<Book>> => {
  try {
    const response = await instance.get(`${API_PATH}/book/${id}`);
    checkResponseStatus(response.status);

    return {
      isSuccess: true,
      isFailure:  false,
      data: response.data,
    }
  } catch(error) {
    return {
      isSuccess: false,
      isFailure: true,
      data: null,
      message: error instanceof Error ? error.message : String(error)
    }
  }
}

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