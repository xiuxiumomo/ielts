import { onUnmounted, ref } from "vue";

/** Provide optional keyboard feedback without external audio assets. */
export function useTypingSound() {
  const soundEnabled = ref<boolean>(true);
  let audioContext: AudioContext | undefined;
  let disposed = false;
  const playKeySound = async (): Promise<void> => {
    if (!soundEnabled.value || disposed || !("AudioContext" in window)) return;
    try {
      audioContext ??= new AudioContext();
      if (audioContext.state === "suspended") await audioContext.resume();
      if (disposed || !soundEnabled.value || audioContext.state !== "running") return;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(680, now);
      oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.035);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(now);
      oscillator.stop(now + 0.05);
    } catch {
      // Audio availability must not block typing.
    }
  };
  onUnmounted(() => {
    disposed = true;
    if (audioContext) void audioContext.close().catch(() => undefined);
  });
  return { soundEnabled, playKeySound };
}
