import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSlideshow } from "../hooks/useSlideshow";
import type { MediaItem } from "../types/media";
import {
  getCachedGifDuration,
  getGifDurationFromUri,
  setCachedGifDuration,
} from "../utils/gif";

export default function HomeScreen() {
  const [isSlideshow, setIsSlideshow] = useState(false);

  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);

  const [processingProgress, setProcessingProgress] = useState(0);

  const [processedCount, setProcessedCount] = useState(0);

  const [totalToProcess, setTotalToProcess] = useState(0);

  const [imageDuration, setImageDuration] = useState("5");

  const {
    currentMedia,
    currentIndex,
    isPlaying,
    start,
    pause,
    next,
    previous,
    exit,
  } = useSlideshow(selectedMedia, (Number(imageDuration) || 5) * 1000);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const media: MediaItem[] = result.assets.map((asset, index) => ({
      id: `${asset.uri}-${index}`,
      uri: asset.uri,
      type: asset.mimeType === "image/gif" ? "gif" : "image",
      asset,
    }));

    const gifs = media.filter((item) => item.type === "gif");

    setTotalToProcess(gifs.length);
    setProcessedCount(0);
    setProcessingProgress(0);

    if (gifs.length > 0) {
      setIsProcessing(true);

      for (let i = 0; i < gifs.length; i++) {
        const gif = gifs[i];

        let duration = getCachedGifDuration(gif.uri);

        if (duration === undefined) {
          duration = await getGifDurationFromUri(gif.uri);

          setCachedGifDuration(gif.uri, duration);
        }

        console.log("GIF duration:", duration, "ms", `(${duration / 1000}s)`);

        const processed = i + 1;

        setProcessedCount(processed);
        setProcessingProgress(processed / gifs.length);
      }

      setIsProcessing(false);
    }

    setSelectedMedia(media);
  };

  const handleStart = () => {
    if (selectedMedia.length === 0) {
      return;
    }

    setIsSlideshow(true);
    start();
  };

  const handleExit = () => {
    pause();
    setIsSlideshow(false);
  };

  return (
    <View style={styles.container}>
      {isProcessing ? (
        <View style={styles.processing}>
          <Text style={styles.processingTitle}>Preparing Media...</Text>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progress,
                {
                  width: `${processingProgress * 100}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.processingText}>
            {processedCount} / {totalToProcess} GIFs
          </Text>

          <Text style={styles.processingPercent}>
            {Math.round(processingProgress * 100)}%
          </Text>
        </View>
      ) : !currentMedia || !isPlaying ? (
        <View style={styles.fullContainer}>
          <View style={styles.emptyState}>
            <Text style={styles.title}>Media Slideshow</Text>

            <Text style={styles.subtitle}>Select your photos and GIFs</Text>

            <Pressable style={styles.button} onPress={pickImages}>
              <Text style={styles.buttonText}>Select Media</Text>
            </Pressable>
          </View>

          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>Image Duration (seconds)</Text>

            <TextInput
              value={imageDuration}
              onChangeText={setImageDuration}
              keyboardType="numeric"
              placeholder="5"
              placeholderTextColor="#777"
              style={styles.durationInput}
            />
          </View>

          <Pressable
            style={[
              styles.button,
              selectedMedia.length === 0 && styles.disabledButton,
            ]}
            onPress={handleStart}
            disabled={selectedMedia.length === 0}
          >
            <Text style={styles.buttonText}>▶ Start Slideshow</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.slideshow}>
          <Image
            source={{ uri: currentMedia.uri }}
            style={styles.media}
            resizeMode="contain"
          />

          <View style={styles.controls}>
            <Pressable style={styles.controlButton} onPress={exit}>
              <Text style={styles.controlText}>✕</Text>
            </Pressable>

            <Pressable style={styles.controlButton} onPress={previous}>
              <Text style={styles.controlText}>⏮</Text>
            </Pressable>

            {!isPlaying ? (
              <Pressable style={styles.controlButton} onPress={start}>
                <Text style={styles.controlText}>▶</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.controlButton} onPress={pause}>
                <Text style={styles.controlText}>⏸</Text>
              </Pressable>
            )}

            <Pressable style={styles.controlButton} onPress={next}>
              <Text style={styles.controlText}>⏭</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },

  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 30,
  },

  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },

  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },

  slideshow: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  media: {
    width: "100%",
    height: "100%",
  },

  info: {
    position: "absolute",
    bottom: 30,
    alignItems: "center",
  },

  counter: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  type: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
  },
  processing: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  processingTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
  },

  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#333",
    borderRadius: 5,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: "#fff",
  },

  processingText: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 15,
  },

  processingPercent: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },

  durationContainer: {
    alignItems: "center",
    marginBottom: 250,
  },

  durationLabel: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },

  durationInput: {
    width: 100,
    height: 45,
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#444",
  },

  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    zIndex: 10,
  },

  controlButton: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  controlText: {
    color: "#fff",
    fontSize: 22,
  },

  disabledButton: {
    opacity: 0.4,
  },
});
