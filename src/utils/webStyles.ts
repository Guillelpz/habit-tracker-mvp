import { Platform, type ViewStyle } from "react-native";

/**
 * Web-only: use pointer cursor on interactive elements (desktop browsers).
 * No-op on native; keeps PRD/ARCHITECTURE web compatibility without breaking native.
 */
export const webPointer: ViewStyle = Platform.OS === "web" ? ({ cursor: "pointer" } as ViewStyle) : {};

/** Web-only: I-beam cursor on text fields (custom hex input, etc.). */
export const webTextCursor: ViewStyle =
  Platform.OS === "web" ? ({ cursor: "text" } as unknown as ViewStyle) : {};
