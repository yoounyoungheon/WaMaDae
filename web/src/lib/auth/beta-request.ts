import { NextResponse, type NextRequest } from "next/server";
import {
  BETA_ACCESS_COOKIE_NAME,
  BETA_REFRESH_COOKIE_NAME,
  BetaAuthConfigurationError,
  verifyBetaAccessToken,
  verifyBetaRefreshToken,
} from "./beta-token";

export async function hasValidBetaAccess(
  request: NextRequest
): Promise<boolean> {
  return hasValidBetaToken(
    request,
    BETA_ACCESS_COOKIE_NAME,
    verifyBetaAccessToken
  );
}

export async function hasValidBetaRefresh(
  request: NextRequest
): Promise<boolean> {
  return hasValidBetaToken(
    request,
    BETA_REFRESH_COOKIE_NAME,
    verifyBetaRefreshToken
  );
}

async function hasValidBetaToken(
  request: NextRequest,
  cookieName: string,
  verifyToken: (token: string) => Promise<boolean>
): Promise<boolean> {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) {
    return false;
  }

  try {
    return await verifyToken(token);
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
