import { File } from "expo-file-system";
import { parseGIF, decompressFrames } from "gifuct-js";

export function getGifDuration(buffer: ArrayBuffer): number {
  const gif = parseGIF(buffer);
  const frames = decompressFrames(gif, true);

  const duration = frames.reduce((total, frame) => {
    return total + frame.delay;
  }, 0);

  return duration * 10;
}

export async function getGifDurationFromUri(
  uri: string
): Promise<number> {
  const file = new File(uri);

  const arrayBuffer = await file.arrayBuffer();

  return getGifDuration(arrayBuffer);
}