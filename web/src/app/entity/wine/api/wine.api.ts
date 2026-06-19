import type {
  Wine,
  WineDetailDto,
  WineSearchItem,
  WineSearchItemDto,
} from "../model/wine.type";
import { mapWineDetailDto, mapWineSearchItemDto } from "./wine.mapper";

type SearchWinesResponse = {
  wines: WineSearchItemDto[];
};

type AnalyzeWineListResponse = {
  wines: WineDetailDto[];
};

type ErrorResponse = {
  message?: string;
};

export async function fetchWineSearch(
  query: string,
  signal?: AbortSignal
): Promise<WineSearchItem[]> {
  const response = await fetch(
    `/api/wines/search?q=${encodeURIComponent(query)}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "와인 검색에 실패했습니다.")
    );
  }

  const data = (await response.json()) as SearchWinesResponse;
  return data.wines.map(mapWineSearchItemDto);
}

export async function analyzeWineList(menuImage: File): Promise<Wine[]> {
  const formData = new FormData();
  formData.append("menuImage", menuImage);

  const response = await fetch("/api/wine-lists/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "와인 리스트 분석에 실패했습니다.")
    );
  }

  const data = (await response.json()) as AnalyzeWineListResponse;
  return data.wines.map(mapWineDetailDto);
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as ErrorResponse;
    return data.message || fallback;
  } catch {
    return fallback;
  }
}
