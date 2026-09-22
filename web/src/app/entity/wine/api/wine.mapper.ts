import type { ExtractedWine } from "../model/wine.type";
import { extractedWineSchema } from "../model/wine.schema";

/**
 * BFF가 정규화해 반환한 추출 와인 항목을 앱 모델로 매핑한다.
 * BFF에서 이미 검증했지만 브라우저 경계에서도 방어적으로 다시 파싱한다.
 * 스키마에 맞지 않는 항목은 제외한다(계약 위반 대신 안전한 부분 표시).
 */
export function mapExtractedWineDto(value: unknown): ExtractedWine | null {
  const parsed = extractedWineSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
