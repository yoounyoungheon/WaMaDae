import "server-only";

/** Next.js BFF에서만 사용하는 mysom-api origin. */
export function getMysomApiBaseUrl(): string {
  const baseUrl = process.env.MYSOM_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error("MYSOM_API_BASE_URL is not configured");
  }

  return baseUrl;
}
