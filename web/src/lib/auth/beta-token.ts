import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const BETA_ACCESS_COOKIE_NAME = "beta_access";
export const BETA_REFRESH_COOKIE_NAME = "beta_refresh";
export const BETA_ACCESS_MAX_AGE_SECONDS = 60 * 15;
export const BETA_REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const BETA_TOKEN_ISSUER = "mysom-web";
export const BETA_ACCESS_TOKEN_AUDIENCE = "beta-access";
export const BETA_REFRESH_TOKEN_AUDIENCE = "beta-refresh";

const BETA_TOKEN_ALGORITHM = "HS256";
const MINIMUM_SECRET_BYTES = 32;
const BETA_ACCESS_TOKEN_TYPE = "beta-access";
const BETA_REFRESH_TOKEN_TYPE = "beta-refresh";

export class BetaAuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BetaAuthConfigurationError";
  }
}

function getSecretKey(): Uint8Array {
  const secret = process.env.BETA_JWT_SECRET;

  if (!secret) {
    throw new BetaAuthConfigurationError("BETA_JWT_SECRET is not configured");
  }

  const encodedSecret = new TextEncoder().encode(secret);
  if (encodedSecret.byteLength < MINIMUM_SECRET_BYTES) {
    throw new BetaAuthConfigurationError(
      `BETA_JWT_SECRET must be at least ${MINIMUM_SECRET_BYTES} bytes`
    );
  }

  return encodedSecret;
}

async function createBetaToken(
  type: string,
  audience: string,
  expirationTime: string
): Promise<string> {
  return new SignJWT({ type })
    .setProtectedHeader({ alg: BETA_TOKEN_ALGORITHM, typ: "JWT" })
    .setIssuer(BETA_TOKEN_ISSUER)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(getSecretKey());
}

async function verifyBetaToken(
  token: string,
  type: string,
  audience: string
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: [BETA_TOKEN_ALGORITHM],
      issuer: BETA_TOKEN_ISSUER,
      audience,
      requiredClaims: ["iat", "exp"],
    });

    return payload.type === type;
  } catch (error) {
    if (error instanceof BetaAuthConfigurationError) {
      throw error;
    }

    return false;
  }
}

export function createBetaAccessToken(): Promise<string> {
  return createBetaToken(
    BETA_ACCESS_TOKEN_TYPE,
    BETA_ACCESS_TOKEN_AUDIENCE,
    "15m"
  );
}

export function createBetaRefreshToken(): Promise<string> {
  return createBetaToken(
    BETA_REFRESH_TOKEN_TYPE,
    BETA_REFRESH_TOKEN_AUDIENCE,
    "7d"
  );
}

export function verifyBetaAccessToken(token: string): Promise<boolean> {
  return verifyBetaToken(
    token,
    BETA_ACCESS_TOKEN_TYPE,
    BETA_ACCESS_TOKEN_AUDIENCE
  );
}

export function verifyBetaRefreshToken(token: string): Promise<boolean> {
  return verifyBetaToken(
    token,
    BETA_REFRESH_TOKEN_TYPE,
    BETA_REFRESH_TOKEN_AUDIENCE
  );
}
