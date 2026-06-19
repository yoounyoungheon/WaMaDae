import { NextResponse } from "next/server";
import { searchWines } from "@/app/entity/wine/api/wine.server";

const MAX_SEARCH_QUERY_LENGTH = 100;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();

  if (query.length === 0) {
    return NextResponse.json({ wines: [] });
  }

  if (query.length > MAX_SEARCH_QUERY_LENGTH) {
    return NextResponse.json(
      { message: "검색어는 100자 이하로 입력해 주세요." },
      { status: 400 }
    );
  }

  return NextResponse.json({ wines: searchWines(query) });
}
