import { NextResponse } from "next/server";
import { getTableKeywords } from "@/app/entity/table-keyword/api/table-keyword.server";

export async function GET() {
  try {
    return NextResponse.json({ keywords: getTableKeywords() });
  } catch {
    return NextResponse.json(
      { message: "테이블 키워드를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
