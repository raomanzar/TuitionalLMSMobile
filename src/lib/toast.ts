import Toast from "react-native-toast-message";
import { getApiErrorMessage } from "./apiError";

/**
 * Thin wrappers over `react-native-toast-message` so screens have one call site
 * for every kind of toast. Surfacing wording stays in the screen (per the
 * api-integration skill — hooks must not toast), but the *how* is centralised
 * here so visual params (position / duration / type) don't drift.
 */

const VISIBILITY_MS = 3500;

export const showApiErrorToast = (
  error: unknown,
  fallback?: string,
  title = "Something went wrong",
) => {
  Toast.show({
    type: "error",
    text1: title,
    text2: getApiErrorMessage(error, fallback),
    position: "top",
    visibilityTime: VISIBILITY_MS,
    autoHide: true,
    topOffset: 56,
  });
};

export const showSuccessToast = (message: string, title = "Success") => {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
    position: "top",
    visibilityTime: VISIBILITY_MS,
    autoHide: true,
    topOffset: 56,
  });
};

export const showInfoToast = (message: string, title = "Info") => {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
    position: "top",
    visibilityTime: VISIBILITY_MS,
    autoHide: true,
    topOffset: 56,
  });
};
