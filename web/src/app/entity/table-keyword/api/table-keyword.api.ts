import type {
  TableKeyword,
  TableKeywordDto,
} from "../model/table-keyword.type";
import { mapTableKeywordDto } from "./table-keyword.mapper";

type GetTableKeywordsResponse = {
  keywords: TableKeywordDto[];
};

type ErrorResponse = {
  message?: string;
};

export async function fetchTableKeywords(
  signal?: AbortSignal
): Promise<TableKeyword[]> {
  const response = await fetch("/api/table-keywords", { signal });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "테이블 키워드를 불러오지 못했습니다.")
    );
  }

  const data = (await response.json()) as GetTableKeywordsResponse;
  return data.keywords.map(mapTableKeywordDto);
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as ErrorResponse;
    return data.message || fallback;
  } catch {
    return fallback;
  }
}
