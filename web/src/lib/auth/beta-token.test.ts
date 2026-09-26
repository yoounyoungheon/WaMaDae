import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose/jwt/sign";
import {
  BETA_TOKEN_AUDIENCE,
  BETA_TOKEN_ISSUER,
  BetaAuthConfigurationError,
  createBetaToken,
  verifyBetaToken,
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

  it("creates and verifies a beta token", async () => {
    const token = await createBetaToken();

    await expect(verifyBetaToken(token)).resolves.toBe(true);
  });

  it("rejects a token with the wrong payload type", async () => {
    const token = await createSignedToken({ type: "member" });

    await expect(verifyBetaToken(token)).resolves.toBe(false);
  });

  it("rejects a tampered token", async () => {
    const token = await createBetaToken();
    const parts = token.split(".");
    const signature = parts[2];
    parts[2] = `${signature.slice(0, -1)}${signature.endsWith("a") ? "b" : "a"}`;

    await expect(verifyBetaToken(parts.join("."))).resolves.toBe(false);
  });

  it("rejects an expired token", async () => {
    const token = await createSignedToken({ type: "beta" }, "-1s");

    await expect(verifyBetaToken(token)).resolves.toBe(false);
  });

  it("rejects a token signed with another secret", async () => {
    const token = await createSignedToken(
      { type: "beta" },
      "7d",
      "another-secret-that-is-at-least-32-bytes-long"
    );

    await expect(verifyBetaToken(token)).resolves.toBe(false);
  });

  it("fails clearly when the JWT secret is missing", async () => {
    delete process.env.BETA_JWT_SECRET;

    await expect(createBetaToken()).rejects.toBeInstanceOf(
      BetaAuthConfigurationError
    );
  });

  it("fails clearly when the JWT secret is too short", async () => {
    process.env.BETA_JWT_SECRET = "short-secret";

    await expect(createBetaToken()).rejects.toBeInstanceOf(
      BetaAuthConfigurationError
    );
  });
});

async function createSignedToken(
  payload: Record<string, unknown>,
  expiresIn = "7d",
  secret = TEST_SECRET
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(BETA_TOKEN_ISSUER)
    .setAudience(BETA_TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(secret));
}
