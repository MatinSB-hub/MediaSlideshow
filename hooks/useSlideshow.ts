import { useEffect, useState } from "react";
import type { MediaItem } from "../types/media";

const IMAGE_DURATION = 5000;

export function useSlideshow(media: MediaItem[]) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMedia = media[currentIndex];

  useEffect(() => {
    if (!currentMedia) {
      return;
    }

    if (currentMedia.type === "image") {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, IMAGE_DURATION);

      return () => clearTimeout(timer);
    }
  }, [currentMedia]);

  return {
    currentMedia,
    currentIndex,
  };
}