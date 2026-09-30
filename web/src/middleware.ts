import { NextResponse, type NextRequest } from "next/server";
import {
  createBetaUnauthorizedResponse,
  hasValidBetaAccess,
  hasValidBetaRefresh,
} from "@/lib/auth/beta-request";
import {
  BETA_ACCESS_COOKIE_NAME,
  BETA_ACCESS_MAX_AGE_SECONDS,
  BETA_REFRESH_COOKIE_NAME,
  createBetaAccessToken,
} from "@/lib/auth/beta-token";

const PUBLIC_API_PATHS = new Set(["/api/beta-auth", "/api/health"]);
const PUBLIC_METADATA_PATHS = new Set([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
]);
const STATIC_FILE_PATTERN = /\.[a-z0-9]+$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAssetPath(pathname) || PUBLIC_API_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const hasAccess = await hasValidBetaAccess(request);

  if (hasAccess) {
    return isBetaPath(pathname)
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  if (await hasValidBetaRefresh(request)) {
    try {
      const accessToken = await createBetaAccessToken();
      const response = isBetaPath(pathname)
        ? NextResponse.redirect(new URL("/", request.url))
        : NextResponse.next({
            request: {
              headers: createHeadersWithAccessToken(request, accessToken),
            },
          });

      setAccessCookie(response, accessToken);
      return response;
    } catch {
      console.error("[beta-auth] Failed to refresh the beta access token.");
    }
  }

  if (isBetaPath(pathname)) {
    return clearBetaCookiesIfPresent(NextResponse.next(), request);
  }

  if (pathname.startsWith("/api/")) {
    return clearBetaCookiesIfPresent(
      createBetaUnauthorizedResponse(),
      request
    );
  }

  return clearBetaCookiesIfPresent(
    NextResponse.redirect(new URL("/beta", request.url)),
    request
  );
}

function isBetaPath(pathname: string): boolean {
  return pathname === "/beta" || pathname.startsWith("/beta/");
}

function createHeadersWithAccessToken(
  request: NextRequest,
  accessToken: string
): Headers {
  const headers = new Headers(request.headers);
  const cookies = request.cookies
    .getAll()
    .filter(({ name }) => name !== BETA_ACCESS_COOKIE_NAME)
    .map(({ name, value }) => `${name}=${value}`);

  cookies.push(`${BETA_ACCESS_COOKIE_NAME}=${accessToken}`);
  headers.set("cookie", cookies.join("; "));
  return headers;
}

function setAccessCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: BETA_ACCESS_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: BETA_ACCESS_MAX_AGE_SECONDS,
  });
}

function clearBetaCookiesIfPresent(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  for (const name of [BETA_ACCESS_COOKIE_NAME, BETA_REFRESH_COOKIE_NAME]) {
    if (request.cookies.has(name)) {
      response.cookies.set({
        name,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }
  }

  return response;
}

function isPublicAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/_next/image/") ||
    PUBLIC_METADATA_PATHS.has(pathname) ||
    (!pathname.startsWith("/api/") && STATIC_FILE_PATTERN.test(pathname))
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
