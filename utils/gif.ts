import { File } from "expo-file-system";

const gifDurationCache = new Map<string, number>();

export function getCachedGifDuration(uri: string) {
  return gifDurationCache.get(uri);
}

export function setCachedGifDuration(uri: string, duration: number) {
  gifDurationCache.set(uri, duration);
}

export async function getGifDurationFromUri(uri: string): Promise<number> {
  const file = new File(uri);

  const buffer = await file.arrayBuffer();

  const bytes = new Uint8Array(buffer);

  let duration = 0;

  for (let i = 0; i < bytes.length - 7; i++) {
    // Graphic Control Extension
    if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9 && bytes[i + 2] === 0x04) {
      // Delay Time = 2 bytes, little-endian
      const delay = bytes[i + 4] | (bytes[i + 5] << 8);

      duration += delay * 10;
    }
  }

  return duration;
}
