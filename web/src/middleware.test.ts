import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SignJWT } from "jose/jwt/sign";
import { NextRequest } from "next/server";
import {
  BETA_ACCESS_COOKIE_NAME,
  BETA_TOKEN_AUDIENCE,
  BETA_TOKEN_ISSUER,
  createBetaToken,
} from "@/lib/auth/beta-token";
import { middleware } from "./middleware";

const TEST_SECRET = "test-secret-that-is-at-least-32-bytes-long";

describe("beta access middleware", () => {
  beforeEach(() => {
    process.env.BETA_JWT_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.BETA_JWT_SECRET;
  });

  it("redirects an unauthenticated page request to /beta", async () => {
    const response = await middleware(createRequest("/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/beta");
  });

  it("allows /beta without a cookie", async () => {
    const response = await middleware(createRequest("/beta"));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects an authenticated /beta request to /", async () => {
    const response = await middleware(
      createRequest("/beta", await createBetaToken())
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });

  it("allows a protected page with a valid cookie", async () => {
    const response = await middleware(
      createRequest("/wine/list", await createBetaToken())
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("rejects a protected API with 401 instead of redirecting", async () => {
    const response = await middleware(createRequest("/api/wine-pairings/chat"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "베타 접근 인증이 필요합니다.",
    });
  });

  it("does not treat an API path with a file extension as a public asset", async () => {
    const response = await middleware(createRequest("/api/private.json"));

    expect(response.status).toBe(401);
  });

  it("redirects a request with a tampered cookie", async () => {
    const token = await createBetaToken();
    const response = await middleware(createRequest("/", `${token}tampered`));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/beta");
  });

  it("redirects a request with an expired cookie", async () => {
    const token = await createExpiredToken();
    const response = await middleware(createRequest("/", token));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/beta");
  });

  it.each([
    "/api/beta-auth",
    "/api/health",
    "/_next/static/chunk.js",
    "/_next/image/image.webp",
    "/images/wines/wine-red.png",
    "/favicon.ico",
  ])("allows public path %s without a cookie", async (pathname) => {
    const response = await middleware(createRequest(pathname));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});

function createRequest(pathname: string, token?: string): NextRequest {
  return new NextRequest(`http://localhost${pathname}`, {
    headers: token
      ? { cookie: `${BETA_ACCESS_COOKIE_NAME}=${token}` }
      : undefined,
  });
}

async function createExpiredToken(): Promise<string> {
  return new SignJWT({ type: "beta" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(BETA_TOKEN_ISSUER)
    .setAudience(BETA_TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("-1s")
    .sign(new TextEncoder().encode(TEST_SECRET));
}
