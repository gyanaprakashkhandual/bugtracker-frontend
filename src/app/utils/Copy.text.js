"use client";

export const copyToClipboard = async (text, showAlert) => {
  try {
    await navigator.clipboard.writeText(text);

    if (showAlert) {
      showAlert({
        message: `Copied: "${text}"`,
        type: "success",
      });
    }

  } catch (error) {
    if (showAlert) {
      showAlert({
        message: "Failed to copy text.",
        type: "error",
      });
    }
    console.error("Copy failed:", error);
  }
};
