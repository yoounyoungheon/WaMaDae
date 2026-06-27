import "server-only";

import { API_PATH, USE_MOCK_API } from "@/app/utils/http/api-query";

interface ApiErrorResponse {
  status?: number;
  message?: string;
}

const buildRequestUrl = (path: string) => {
  if (!API_PATH) {
    throw new Error("API base URL이 설정되지 않았습니다.");
  }

  const normalizedPath = path.replace(/^\/+/, "");
  const requestPath = USE_MOCK_API
    ? normalizedPath === "wine-preference-options"
      ? "/api/mock/"
      : `/api/mock/${normalizedPath}`
    : `/api/${normalizedPath}`;

  return new URL(requestPath, API_PATH).toString();
};

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
