import "server-only";

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46];
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50];
const FTYP_SIGNATURE = [0x66, 0x74, 0x79, 0x70];
const HEIF_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "mif1",
  "msf1",
]);

export async function hasValidWineMenuImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  switch (file.type) {
    case "image/jpeg":
      return startsWith(bytes, JPEG_SIGNATURE);
    case "image/png":
      return startsWith(bytes, PNG_SIGNATURE);
    case "image/webp":
      return (
        startsWith(bytes, RIFF_SIGNATURE) &&
        startsWith(bytes.slice(8), WEBP_SIGNATURE)
      );
    case "image/heic":
    case "image/heif":
      return (
        startsWith(bytes.slice(4), FTYP_SIGNATURE) &&
        HEIF_BRANDS.has(readAscii(bytes.slice(8, 12)))
      );
    default:
      return false;
  }
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}

function readAscii(bytes: Uint8Array) {
  return String.fromCharCode(...bytes);
}
