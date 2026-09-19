import { describe, expect, it } from "vitest";
import {
  getWineMenuImageValidationMessage,
  MAX_WINE_MENU_IMAGE_COUNT,
  validateWineMenuImageAddition,
} from "./wine-menu-image";

function makeFile(
  name: string,
  { type = "image/png", size = 1024 }: { type?: string; size?: number } = {}
): File {
  const file = new File([new Uint8Array(size)], name, { type });
  return file;
}

describe("getWineMenuImageValidationMessage", () => {
  it("PNG/JPEG 유효 파일은 null을 반환한다", () => {
    expect(getWineMenuImageValidationMessage(makeFile("a.png"))).toBeNull();
    expect(
      getWineMenuImageValidationMessage(makeFile("a.jpg", { type: "image/jpeg" }))
    ).toBeNull();
  });

  it("빈 파일을 거부한다", () => {
    expect(
      getWineMenuImageValidationMessage(makeFile("a.png", { size: 0 }))
    ).toMatch(/비어 있는/);
  });

  it("확장자가 허용 목록에 없으면 거부한다", () => {
    expect(
      getWineMenuImageValidationMessage(makeFile("a.gif", { type: "image/png" }))
    ).toMatch(/JPG, PNG/);
  });

  it("MIME이 이미지가 아니면 거부한다", () => {
    expect(
      getWineMenuImageValidationMessage(
        makeFile("a.png", { type: "application/pdf" })
      )
    ).toMatch(/JPG, PNG/);
  });
});

describe("validateWineMenuImageAddition", () => {
  it("개수 상한을 초과하면 선택 레벨 오류를 반환한다", () => {
    const existing = Array.from({ length: MAX_WINE_MENU_IMAGE_COUNT }, (_, i) =>
      makeFile(`existing-${i}.png`)
    );
    const error = validateWineMenuImageAddition(existing, [makeFile("new.png")]);
    expect(error?.isSelectionLevel).toBe(true);
    expect(error?.message).toMatch(/최대/);
  });

  it("총 용량 상한을 초과하면 선택 레벨 오류를 반환한다", () => {
    const big = makeFile("big.png", { size: 9 * 1024 * 1024 });
    const existing = [big, makeFile("b.png", { size: 9 * 1024 * 1024 })];
    const additions = [
      makeFile("c.png", { size: 9 * 1024 * 1024 }),
      makeFile("d.png", { size: 9 * 1024 * 1024 }),
      makeFile("e.png", { size: 9 * 1024 * 1024 }),
      makeFile("f.png", { size: 9 * 1024 * 1024 }),
    ];
    const error = validateWineMenuImageAddition(existing, additions);
    expect(error?.isSelectionLevel).toBe(true);
  });

  it("파일별 형식 오류는 파일 레벨 오류로 반환한다", () => {
    const error = validateWineMenuImageAddition(
      [],
      [makeFile("bad.gif", { type: "image/gif" })]
    );
    expect(error?.isSelectionLevel).toBe(false);
  });

  it("모든 파일이 유효하고 제한 이내면 null을 반환한다", () => {
    expect(
      validateWineMenuImageAddition([makeFile("a.png")], [makeFile("b.png")])
    ).toBeNull();
  });
});
