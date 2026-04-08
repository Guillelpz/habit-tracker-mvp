import { Platform, type ViewStyle } from "react-native";

/**
 * Web-only: use pointer cursor on interactive elements (desktop browsers).
 * No-op on native; keeps PRD/ARCHITECTURE web compatibility without breaking native.
 */
export const webPointer: ViewStyle = Platform.OS === "web" ? ({ cursor: "pointer" } as ViewStyle) : {};
