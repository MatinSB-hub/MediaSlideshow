import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "../types/media";
import { getCachedGifDuration } from "../utils/gif";

const DEFAULT_IMAGE_DURATION = 5000;

export function useSlideshow(
  media: MediaItem[],
  imageDuration = DEFAULT_IMAGE_DURATION,
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStart, setIsStart] = useState(false);

  const currentMedia = media[currentIndex];

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTimeRef = useRef<number | null>(null);

  const remainingTimeRef = useRef<number | null>(null);

  const getDuration = () => {
    if (!currentMedia) {
      return 0;
    }

    if (currentMedia.type === "image") {
      return imageDuration;
    }

    return getCachedGifDuration(currentMedia.uri) ?? 0;
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = (duration: number) => {
    clearTimer();

    startTimeRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      if (currentIndex < media.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, duration);
  };

  useEffect(() => {
    if (!isPlaying || !currentMedia) {
      return;
    }

    const duration = remainingTimeRef.current ?? getDuration();

    if (duration <= 0) {
      return;
    }

    remainingTimeRef.current = null;

    startTimer(duration);

    return clearTimer;
  }, [currentMedia, currentIndex, isPlaying, imageDuration]);

  const start = () => {
    if (!currentMedia) {
      return;
    }

    setIsPlaying(true);
    setIsStart(true);
  };

  const pause = () => {
    if (!isPlaying) {
      return;
    }

    const startTime = startTimeRef.current;

    if (startTime !== null) {
      const elapsed = Date.now() - startTime;

      const currentDuration = getDuration();

      remainingTimeRef.current = Math.max(currentDuration - elapsed, 0);
    }

    clearTimer();

    setIsPlaying(false);
  };

  const next = () => {
    clearTimer();

    remainingTimeRef.current = null;

    if (currentIndex < media.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const previous = () => {
    clearTimer();

    remainingTimeRef.current = null;

    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const exit = () => {
    clearTimer();

    remainingTimeRef.current = null;
    startTimeRef.current = null;

    setIsPlaying(false);
    setCurrentIndex(0);
    setIsStart(false);
  };

  return {
    currentMedia,
    currentIndex,
    isPlaying,
    isStart,
    start,
    pause,
    next,
    previous,
    exit,
  };
}
