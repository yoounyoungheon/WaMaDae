'use server';

import { APIResponseType, checkResponseStatus, instance } from "@/app/utils/http"
import { API_PATH } from "@/app/utils/http/api-query"
import { WineModel } from "../model/wine-model";

interface WineModelResponse {
  data: WineModel[];
  count: number;
  nextPage: string | null;
}

export const getAllWines = async (page?:number, size?:number): Promise<APIResponseType<WineModelResponse>> => {
  try {
    const response = await instance.get(`${API_PATH}/v1/wines?page=${page}&size=${size}`);
    checkResponseStatus(response.status);

    return {
      isSuccess: true,
      isFailure: false,
      data: response.data as WineModelResponse,
      message: "와인 리스트를 성공적으로 가져왔습니다."
    }
  } catch (error) {
    return {
      isSuccess: false,
      isFailure: true,
      data: null,
      message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
    }
  }   
}

export const getShopWines = async (shopId:number, page?:number, size?:number):Promise<APIResponseType<WineModelResponse>> => {
  try{
    const response = await instance.get(`${API_PATH}/v1/restaurants/${shopId}/wines?page=${page === undefined?1:page}&size=${size === undefined?1:size}`);
    checkResponseStatus(response.status);
    
    return {
      isSuccess: true,
      isFailure: false,
      data: response.data as WineModelResponse,
      message: "와인 리스트를 성공적으로 가져왔습니다."
    }
  } catch (error) {
    return {
      isSuccess: false,
      isFailure: true,
      data: null,
      message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
    }
  }   
}