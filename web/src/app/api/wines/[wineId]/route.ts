import { NextResponse } from "next/server";
import { getWineDetail } from "@/app/entity/wine/api/wine.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ wineId: string }> }
) {
  const { wineId } = await params;
  const wine = getWineDetail(wineId);

  if (!wine) {
    return NextResponse.json(
      { message: "와인을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({ wine });
}
