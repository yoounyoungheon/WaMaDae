import axios, { AxiosError, AxiosResponse } from "axios";
import { cookies } from "next/headers";

export interface APIResponseType<T> {
  isSuccess: boolean;
  isFailure: boolean;
  data: T | null;
  message?: string 
}

export const checkResponseStatus = (statusCode: number) => {
  if (statusCode !== 200 && statusCode !== 201) {
    throw new AxiosError();
  }
};

export const instance = axios.create({
  withCredentials: true,
});

instance.interceptors.response.use((response: AxiosResponse) => {
  return response;
});

instance.interceptors.request.use(
  function (config) {
    const token = cookies().get("token")?.value;
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
