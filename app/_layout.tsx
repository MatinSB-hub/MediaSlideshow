import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useSlideshow } from "../hooks/useSlideshow";
import type { MediaItem } from "../types/media";
import { getGifDurationFromUri } from "../utils/gif";

export default function HomeScreen() {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);

  const { currentMedia, currentIndex } = useSlideshow(selectedMedia);

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

    for (const item of media) {
      if (item.type === "gif") {
        const duration = await getGifDurationFromUri(item.uri);

        console.log("GIF duration:", duration, "ms");
      }
    }

    setSelectedMedia(media);
  };

  return (
    <View style={styles.container}>
      {!currentMedia ? (
        <View style={styles.emptyState}>
          <Text style={styles.title}>Media Slideshow</Text>

          <Text style={styles.subtitle}>Select your photos and GIFs</Text>

          <Pressable style={styles.button} onPress={pickImages}>
            <Text style={styles.buttonText}>Select Media</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.slideshow}>
          <Image
            source={{ uri: currentMedia.uri }}
            style={styles.media}
            resizeMode="contain"
          />

          <View style={styles.info}>
            <Text style={styles.counter}>
              {currentIndex + 1} / {selectedMedia.length}
            </Text>

            <Text style={styles.type}>{currentMedia.type.toUpperCase()}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
