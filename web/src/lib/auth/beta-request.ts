import { NextResponse, type NextRequest } from "next/server";
import {
  BETA_ACCESS_COOKIE_NAME,
  BetaAuthConfigurationError,
  verifyBetaToken,
} from "./beta-token";

export async function hasValidBetaAccess(
  request: NextRequest
): Promise<boolean> {
  const token = request.cookies.get(BETA_ACCESS_COOKIE_NAME)?.value;
  if (!token) {
    return false;
  }

  try {
    return await verifyBetaToken(token);
  } catch (error) {
    if (error instanceof BetaAuthConfigurationError) {
      console.error("[beta-auth] BETA_JWT_SECRET is not configured correctly.");
    }
    return false;
  }
}

export function createBetaUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { message: "베타 접근 인증이 필요합니다." },
    {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
