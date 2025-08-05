'use server';

import { APIResponseType, instance } from "@/app/utils/http"
import { API_PATH } from "@/app/utils/http/api-query"
import { WineModel } from "../model/wine-model";

interface WineModelResponse {
  data: WineModel[];
  count: number;
  nextPage: string | null;
}

export const getShopWineList = async (shopId: number):Promise<APIResponseType<WineModelResponse>> => {
  try{
    const response = await instance.get(`${API_PATH}/v1/restaurants/${shopId}/wines`);

    // ** 상태 코드가 200 또는 201이 아닌 경우 예외를 발생시킴
    if(response.status !== 200 && response.status !== 201) {
      return {
        isSuccess: false,
        isFailure: true,
        data: null,
        message: "와인 리스트를 가져오는 데 실패했습니다."
      }
    }

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