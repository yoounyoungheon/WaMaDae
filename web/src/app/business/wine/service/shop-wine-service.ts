'use server';

import { APIResponseType, checkResponseStatus, instance } from "@/app/utils/http"
import { API_PATH } from "@/app/utils/http/api-query"
import { createWineModel, WineModel } from "../model/wine-model";

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
    // const response = await instance.get(`${API_PATH}/v1/restaurants/${shopId}/wines?page=${page === undefined?1:page}&size=${size === undefined?1:size}`);
    // checkResponseStatus(response.status);
    // 모킹
    const data = {
      data: [
        createWineModel({id: 1, name: '화이트 와인', country: '대한민국', winery: '성수와이너리', region:'파리', sweetness:3, body:5, tannin:4, acidity:3, image:'carrot6.jpeg',description:'맛있는 와인'}),
        createWineModel({id: 2, name: '화이트 와인', country: '대한민국', winery: '성수와이너리', region:'파리', sweetness:3, body:5, tannin:4, acidity:3, image:'carrot6.jpeg',description:'맛있는 와인'}),
        createWineModel({id: 3, name: '화이트 와인', country: '대한민국', winery: '성수와이너리', region:'파리', sweetness:3, body:5, tannin:4, acidity:3, image:'carrot6.jpeg',description:'맛있는 와인'}),
        createWineModel({id: 4, name: '화이트 와인', country: '대한민국', winery: '성수와이너리', region:'파리', sweetness:3, body:5, tannin:4, acidity:3, image:'carrot6.jpeg',description:'맛있는 와인'})
      ],
      count: 0,
      nextPage: null
    }
    
    return {
      isSuccess: true,
      isFailure: false,
      data: data,
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