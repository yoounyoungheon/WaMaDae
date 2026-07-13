/**
 * UUID v4 문자열을 생성한다.
 *
 * `crypto.randomUUID()`는 secure context(https/localhost)에서만 제공되므로,
 * WebView·LAN IP(http) 등 비보안 컨텍스트에서는 `getRandomValues` 기반으로 생성한다.
 */
export function generateUuid(): string {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  if (typeof cryptoApi?.getRandomValues === "function") {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
    return formatUuidV4(bytes);
  }

  // 암호학적 난수가 없는 예외적 환경 최후 fallback(식별자 용도로 충분).
  const bytes = Uint8Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256)
  );
  return formatUuidV4(bytes);
}

function formatUuidV4(bytes: Uint8Array): string {
  // RFC 4122 version(4)과 variant(10xx) 비트를 설정한다.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}
