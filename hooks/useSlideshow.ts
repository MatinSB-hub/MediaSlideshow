import { useEffect, useState } from "react";
import type { MediaItem } from "../types/media";
import { getCachedGifDuration } from "../utils/gif";

const IMAGE_DURATION = 5000;

export function useSlideshow(media: MediaItem[]) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMedia = media[currentIndex];

  useEffect(() => {
    if (!currentMedia) {
      return;
    }

    let duration: number;

    if (currentMedia.type === "image") {
      duration = IMAGE_DURATION;
    } else {
      const gifDuration = getCachedGifDuration(currentMedia.uri);

      if (gifDuration === undefined) {
        return;
      }

      duration = gifDuration;
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentMedia]);

  return {
    currentMedia,
    currentIndex,
  };
}