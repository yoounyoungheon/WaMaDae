import "server-only";

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export async function hasValidWineMenuImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());

  switch (file.type) {
    case "image/jpeg":
      return startsWith(bytes, JPEG_SIGNATURE);
    case "image/png":
      return startsWith(bytes, PNG_SIGNATURE);
    default:
      return false;
  }
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}
