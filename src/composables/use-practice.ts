import { computed, onMounted, onUnmounted, reactive, ref, toRefs } from "vue";
import axios from "axios";
import * as XLSX from "xlsx";
import { useMessage } from "@/composables/use-message";
import type { IPracticeQuestion, TPracticeMode } from "@/types/practice";

const storageKey = "ielts-vocab-completed";

/** Share Excel loading, navigation and persisted completion across practice pages. */
export function usePractice(getMode: () => TPracticeMode) {
  const message = useMessage();
  const state = reactive<{ questionList: IPracticeQuestion[]; completedKeywords: string[] }>({
    questionList: [],
    completedKeywords: [],
  });
  const currentIndex = ref<number>(0);
  const loading = ref<boolean>(true);
  const loadError = ref<string>("");
  let request: AbortController | undefined;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (Array.isArray(parsed))
      state.completedKeywords = parsed.filter((item): item is string => typeof item === "string");
  } catch {
    /* Ignore unavailable or invalid local storage. */
  }
  const currentQuestion = computed(() => state.questionList[currentIndex.value]);
  const isCurrentCompleted = computed(() =>
    Boolean(
      currentQuestion.value && state.completedKeywords.includes(currentQuestion.value.keyword)
    )
  );
  const loadQuestions = async (): Promise<void> => {
    request?.abort();
    const controller = new AbortController();
    request = controller;
    loading.value = true;
    loadError.value = "";
    try {
      const response = await axios.get<ArrayBuffer>(`${import.meta.env.BASE_URL}iets.xlsx`, {
        responseType: "arraybuffer",
        signal: controller.signal,
      });
      const workbook = XLSX.read(response.data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error("Excel 中没有可用工作表");
      state.questionList = XLSX.utils
        .sheet_to_json<Record<string, unknown>>(sheet)
        .map((item) => ({
          answer: String(item.answer ?? "")
            .trim()
            .replace(/\s+/g, " "),
          keyword: String(item.keyword ?? "").trim(),
          chinese: String(item.chinese ?? ""),
          phonetic: String(item.phonetic ?? ""),
          example: String(item.example ?? ""),
        }))
        .filter((item) => item.answer && item.keyword);
      currentIndex.value = 0;
    } catch {
      if (!controller.signal.aborted) {
        loadError.value = "题目加载失败，请检查 iets.xlsx 文件";
        message.error(loadError.value);
      }
    } finally {
      if (!controller.signal.aborted) loading.value = false;
    }
  };
  const onSuccess = (): void => {
    const question = currentQuestion.value;
    if (!question) return;
    message.success({ message: "本题完成，可以进入下一题！", duration: 2000 });
    if (state.completedKeywords.includes(question.keyword)) return;
    state.completedKeywords.push(question.keyword);
    try {
      localStorage.setItem(storageKey, JSON.stringify(state.completedKeywords));
    } catch {
      message.warning("本题已完成，但进度保存失败");
    }
  };
  const nextQuestion = (): void => {
    const total = state.questionList.length;
    if (total <= 1) return;
    const randomIndex = Math.floor(Math.random() * (total - 1));
    currentIndex.value = randomIndex >= currentIndex.value ? randomIndex + 1 : randomIndex;
  };
  const prevQuestion = (): void => {
    if (getMode() === "typing") {
      nextQuestion();
      return;
    }
    const total = state.questionList.length;
    if (total) currentIndex.value = (currentIndex.value + total - 1) % total;
  };
  onMounted(loadQuestions);
  onUnmounted(() => request?.abort());
  return {
    ...toRefs(state),
    currentIndex,
    currentQuestion,
    loading,
    loadError,
    isCurrentCompleted,
    loadQuestions,
    onSuccess,
    nextQuestion,
    prevQuestion,
  };
}
