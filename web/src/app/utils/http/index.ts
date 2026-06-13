import axios, { AxiosError, AxiosResponse } from "axios";
import { cookies } from "next/headers";

export interface APIResponseType<T> {
  isSuccess: boolean;
  isFailure: boolean;
  data: T | null;
  message?: string 
}

export interface PaginationRequestType<T = unknown> {
  page: number;
  size: number;
  data?: T;
}

export const buildPaginationRequest = <T>(page: number, size: number, data: T) => {

  return {
    page,
    size,
    data
  } as PaginationRequestType<T>;
}

export const checkResponseStatus = (statusCode: number) => {
  if (statusCode !== 200 && statusCode !== 201) {
    throw new AxiosError("에러가 발생했습니다. 잠시후 다시 시도해주세요.");
  }
};

export const instance = axios.create({
  withCredentials: true,
});

instance.interceptors.response.use((response: AxiosResponse) => {
  return response;
});

instance.interceptors.request.use(
  async function (config) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
