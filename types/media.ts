import type { ImagePickerAsset } from "expo-image-picker";

export type MediaType = "image" | "gif";

export type MediaItem = {
  id: string;
  uri: string;
  type: MediaType;
  asset: ImagePickerAsset;
};