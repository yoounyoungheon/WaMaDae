import { NextResponse, type NextRequest } from "next/server";
import {
  createBetaUnauthorizedResponse,
  hasValidBetaAccess,
} from "@/lib/auth/beta-request";

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

  if (pathname === "/beta" || pathname.startsWith("/beta/")) {
    return hasAccess
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  if (hasAccess) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return createBetaUnauthorizedResponse();
  }

  return NextResponse.redirect(new URL("/beta", request.url));
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
