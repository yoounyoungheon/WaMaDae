import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const BETA_ACCESS_COOKIE_NAME = "beta_access";
export const BETA_ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const BETA_TOKEN_ISSUER = "mysom-web";
export const BETA_TOKEN_AUDIENCE = "beta-access";

const BETA_TOKEN_ALGORITHM = "HS256";
const MINIMUM_SECRET_BYTES = 32;

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

export async function createBetaToken(): Promise<string> {
  return new SignJWT({ type: "beta" })
    .setProtectedHeader({ alg: BETA_TOKEN_ALGORITHM, typ: "JWT" })
    .setIssuer(BETA_TOKEN_ISSUER)
    .setAudience(BETA_TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifyBetaToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: [BETA_TOKEN_ALGORITHM],
      issuer: BETA_TOKEN_ISSUER,
      audience: BETA_TOKEN_AUDIENCE,
      requiredClaims: ["iat", "exp"],
    });

    return payload.type === "beta";
  } catch (error) {
    if (error instanceof BetaAuthConfigurationError) {
      throw error;
    }

    return false;
  }
}
