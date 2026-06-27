import "server-only";

import { MYSOM_API_BASE_URL } from "@/app/utils/http/api-query";

interface ApiErrorResponse {
  status?: number;
  message?: string;
}

const buildRequestUrl = (path: string) => {
  return buildMysomApiUrl(`/api/${path.replace(/^\/+/, "")}`).toString();
};

export const buildMysomApiUrl = (path: string) =>
  new URL(path, MYSOM_API_BASE_URL);

export const requestServerApi = (path: string, init?: RequestInit) => {
  return fetch(buildRequestUrl(path), {
    cache: "no-store",
    ...init,
  });
};

export const parseServerApiError = async (response: Response) => {
  try {
    const errorBody = (await response.json()) as ApiErrorResponse;

    if (errorBody.message) {
      return errorBody.message;
    }
  } catch {
    return null;
  }

  return null;
};
