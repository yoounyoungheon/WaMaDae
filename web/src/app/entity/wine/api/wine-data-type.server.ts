import "server-only";

import type { WineDataType } from "../model/wine.type";

const DEFAULT_WINE_DATA_TYPE: WineDataType = "OCR";

export function getWineDataType(): WineDataType {
  const value = process.env.WINE_DATA_TYPE?.trim() || DEFAULT_WINE_DATA_TYPE;

  if (value === "OCR" || value === "DB") {
    return value;
  }

  throw new Error('Invalid WINE_DATA_TYPE. Use "OCR" or "DB".');
}
