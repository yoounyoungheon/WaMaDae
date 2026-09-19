// 백엔드(Spring UUID.fromString)는 버전/variant를 가리지 않으므로 일반 8-4-4-4-12 hex를 허용한다.
// 프론트가 생성하는 crypto.randomUUID()(v4)와 API 예시의 UUIDv7을 모두 통과시킨다.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuidString(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value.trim());
}

export function normalizeUuid(value: unknown): string | null {
  return isUuidString(value) ? value.trim() : null;
}
