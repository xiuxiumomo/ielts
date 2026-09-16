import { onUnmounted, ref } from "vue";

/** Read English aloud and cancel playback when leaving the practice. */
export function useSpeech() {
  const speechMessage = ref<string>("");
  let disposed = false;
  const speak = (text: string): void => {
    speechMessage.value = "";
    if (!("speechSynthesis" in window)) {
      speechMessage.value = "当前浏览器不支持朗读，请使用支持语音的浏览器。";
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.onerror = (event) => {
      if (!disposed && !["canceled", "interrupted"].includes(event.error)) {
        speechMessage.value = "朗读未能播放，请点击「再听一遍」重试。";
      }
    };
    window.speechSynthesis.speak(utterance);
  };
  onUnmounted(() => {
    disposed = true;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });
  return { speak, speechMessage };
}
