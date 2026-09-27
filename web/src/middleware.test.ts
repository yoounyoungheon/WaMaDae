import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SignJWT } from "jose/jwt/sign";
import { NextRequest } from "next/server";
import {
  BETA_ACCESS_COOKIE_NAME,
  BETA_ACCESS_TOKEN_AUDIENCE,
  BETA_REFRESH_COOKIE_NAME,
  BETA_REFRESH_TOKEN_AUDIENCE,
  BETA_TOKEN_ISSUER,
  createBetaAccessToken,
  createBetaRefreshToken,
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
      createRequest("/beta", { access: await createBetaAccessToken() })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });

  it("allows a protected page with a valid access token", async () => {
    const response = await middleware(
      createRequest("/wine/list", { access: await createBetaAccessToken() })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.cookies.get(BETA_ACCESS_COOKIE_NAME)).toBeUndefined();
  });

  it("renews a missing access token with a valid refresh token", async () => {
    const response = await middleware(
      createRequest("/wine/list", { refresh: await createBetaRefreshToken() })
    );
    const renewedAccess = response.cookies.get(BETA_ACCESS_COOKIE_NAME);

    expect(response.status).toBe(200);
    expect(renewedAccess).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 900,
    });
    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      `${BETA_ACCESS_COOKIE_NAME}=${renewedAccess?.value}`
    );
  });

  it("renews an expired access token for the current API request", async () => {
    const response = await middleware(
      createRequest("/api/wine-pairings/chat", {
        access: await createExpiredToken(
          "beta-access",
          BETA_ACCESS_TOKEN_AUDIENCE
        ),
        refresh: await createBetaRefreshToken(),
      })
    );
    const renewedAccess = response.cookies.get(BETA_ACCESS_COOKIE_NAME);

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(renewedAccess?.value).toBeTruthy();
    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      `${BETA_ACCESS_COOKIE_NAME}=${renewedAccess?.value}`
    );
  });

  it("renews access and redirects /beta when only refresh is valid", async () => {
    const response = await middleware(
      createRequest("/beta", { refresh: await createBetaRefreshToken() })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
    expect(response.cookies.get(BETA_ACCESS_COOKIE_NAME)?.maxAge).toBe(900);
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

  it("redirects a request with a tampered access token and no refresh token", async () => {
    const token = await createBetaAccessToken();
    const response = await middleware(
      createRequest("/", { access: `${token}tampered` })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/beta");
    expect(response.cookies.get(BETA_ACCESS_COOKIE_NAME)?.maxAge).toBe(0);
  });

  it("clears both cookies when access and refresh tokens are expired", async () => {
    const response = await middleware(
      createRequest("/", {
        access: await createExpiredToken(
          "beta-access",
          BETA_ACCESS_TOKEN_AUDIENCE
        ),
        refresh: await createExpiredToken(
          "beta-refresh",
          BETA_REFRESH_TOKEN_AUDIENCE
        ),
      })
    );

    expect(response.status).toBe(307);
    expect(response.cookies.get(BETA_ACCESS_COOKIE_NAME)?.maxAge).toBe(0);
    expect(response.cookies.get(BETA_REFRESH_COOKIE_NAME)?.maxAge).toBe(0);
  });

  it("does not accept a refresh token as an access token", async () => {
    const response = await middleware(
      createRequest("/", { access: await createBetaRefreshToken() })
    );

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

function createRequest(
  pathname: string,
  tokens: { access?: string; refresh?: string } = {}
): NextRequest {
  const cookies = [
    tokens.access
      ? `${BETA_ACCESS_COOKIE_NAME}=${tokens.access}`
      : undefined,
    tokens.refresh
      ? `${BETA_REFRESH_COOKIE_NAME}=${tokens.refresh}`
      : undefined,
  ].filter(Boolean);

  return new NextRequest(`http://localhost${pathname}`, {
    headers: cookies.length > 0 ? { cookie: cookies.join("; ") } : undefined,
  });
}

async function createExpiredToken(
  type: "beta-access" | "beta-refresh",
  audience: string
): Promise<string> {
  return new SignJWT({ type })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(BETA_TOKEN_ISSUER)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("-1s")
    .sign(new TextEncoder().encode(TEST_SECRET));
}
