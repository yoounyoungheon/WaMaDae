import { NextResponse } from "next/server";

export async function GET() {
  // 필요한 경우 여기서 데이터베이스 연결 상태나 외부 서비스 상태를 확인할 수 있습니다.
  // const isDbConnected = await checkDatabase();

  return NextResponse.json(
    { status: "ok", timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
