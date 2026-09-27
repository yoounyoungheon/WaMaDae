import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose/jwt/sign";
import {
  BETA_ACCESS_TOKEN_AUDIENCE,
  BETA_REFRESH_TOKEN_AUDIENCE,
  BETA_TOKEN_ISSUER,
  BetaAuthConfigurationError,
  createBetaAccessToken,
  createBetaRefreshToken,
  verifyBetaAccessToken,
  verifyBetaRefreshToken,
} from "./beta-token";

const TEST_SECRET = "test-secret-that-is-at-least-32-bytes-long";

describe("beta token", () => {
  beforeEach(() => {
    process.env.BETA_JWT_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.BETA_JWT_SECRET;
  });

  it("creates and verifies an access token", async () => {
    const token = await createBetaAccessToken();

    await expect(verifyBetaAccessToken(token)).resolves.toBe(true);
  });

  it("creates and verifies a refresh token", async () => {
    const token = await createBetaRefreshToken();

    await expect(verifyBetaRefreshToken(token)).resolves.toBe(true);
  });

  it("does not allow access and refresh tokens to replace each other", async () => {
    const [accessToken, refreshToken] = await Promise.all([
      createBetaAccessToken(),
      createBetaRefreshToken(),
    ]);

    await expect(verifyBetaRefreshToken(accessToken)).resolves.toBe(false);
    await expect(verifyBetaAccessToken(refreshToken)).resolves.toBe(false);
  });

  it("rejects a token with the wrong payload type", async () => {
    const token = await createSignedToken(
      { type: "member" },
      BETA_ACCESS_TOKEN_AUDIENCE
    );

    await expect(verifyBetaAccessToken(token)).resolves.toBe(false);
  });

  it("rejects a tampered access token", async () => {
    const token = await createBetaAccessToken();
    const parts = token.split(".");
    const signature = parts[2];
    parts[2] = `${signature.slice(0, -1)}${signature.endsWith("a") ? "b" : "a"}`;

    await expect(verifyBetaAccessToken(parts.join("."))).resolves.toBe(false);
  });

  it.each([
    ["access", "beta-access", BETA_ACCESS_TOKEN_AUDIENCE, verifyBetaAccessToken],
    [
      "refresh",
      "beta-refresh",
      BETA_REFRESH_TOKEN_AUDIENCE,
      verifyBetaRefreshToken,
    ],
  ] as const)("rejects an expired %s token", async (_, type, audience, verify) => {
    const token = await createSignedToken({ type }, audience, "-1s");

    await expect(verify(token)).resolves.toBe(false);
  });

  it("rejects an access token signed with another secret", async () => {
    const token = await createSignedToken(
      { type: "beta-access" },
      BETA_ACCESS_TOKEN_AUDIENCE,
      "15m",
      "another-secret-that-is-at-least-32-bytes-long"
    );

    await expect(verifyBetaAccessToken(token)).resolves.toBe(false);
  });

  it("fails clearly when the JWT secret is missing", async () => {
    delete process.env.BETA_JWT_SECRET;

    await expect(createBetaAccessToken()).rejects.toBeInstanceOf(
      BetaAuthConfigurationError
    );
  });

  it("fails clearly when the JWT secret is too short", async () => {
    process.env.BETA_JWT_SECRET = "short-secret";

    await expect(createBetaRefreshToken()).rejects.toBeInstanceOf(
      BetaAuthConfigurationError
    );
  });
});

async function createSignedToken(
  payload: Record<string, unknown>,
  audience: string,
  expiresIn = "7d",
  secret = TEST_SECRET
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(BETA_TOKEN_ISSUER)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(secret));
}
