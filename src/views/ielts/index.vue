<template>
  <main class="english-words">
    <div class="study-shell">
      <header class="page-header">
        <div>
          <span class="eyebrow">THE VOCABULARY NOTEBOOK</span>
          <h1>让每一个单词，<span>成为积累。</span></h1>
          <p class="page-description">听一句，想一想。在语境中，慢慢记住新的表达。</p>
        </div>
        <span class="course-label">IELTS <span>/</span> 词汇练习</span>
      </header>
      <section class="study-card" aria-label="单词练习">
        <p v-if="loading" class="state-message" role="status">正在翻开你的单词本...</p>
        <div v-else-if="loadError" class="state-message" role="alert">
          <p>{{ loadError }}</p>
          <ElButton type="primary" @click="loadQuestions">重新加载</ElButton>
        </div>
        <template v-else-if="currentQuestion">
          <div class="question-toolbar">
            <div class="question-heading">
              <span class="lesson-label"
                >单词与语境 <span class="toolbar-divider">/</span>
                <strong>{{ String(currentIndex + 1).padStart(2, "0") }}</strong>
                <span class="total-count">/ {{ questionList.length }}</span></span
              >
              <span
                class="completion-badge"
                :class="{ 'is-completed': isCurrentCompleted }"
                role="status"
              >
                <svg
                  v-if="isCurrentCompleted"
                  aria-hidden="true"
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="m3 8 3 3 7-7"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {{ isCurrentCompleted ? "已做" : "未做" }}
              </span>
            </div>
            <span class="practice-status">{{
              isCurrentCompleted ? "已完成 · 可以再次温习" : "专注当下这一题"
            }}</span>
          </div>
          <WordSort
            ref="wordSortRef"
            :question="currentQuestion"
            :completed="isCurrentCompleted"
            @success="onSuccess"
          />
          <footer class="lesson-footer">
            <ElButton class="reset-button" text @click="resetCurrent">重新练习</ElButton>
            <div class="navigation">
              <ElButton @click="prevQuestion">上一题</ElButton>
              <ElButton type="primary" @click="nextQuestion"
                >下一题 <span aria-hidden="true">→</span></ElButton
              >
            </div>
          </footer>
        </template>
        <p v-else class="state-message">
          暂无可用题目，请检查 iets.xlsx 中的 keyword 和 answer 列。
        </p>
      </section>
      <p class="page-note">
        一点一滴，自有回响 <span aria-hidden="true">·</span> 学习进度自动保存在本机
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import axios from "axios";
import { ElButton, ElMessage } from "element-plus";
import { computed, onMounted, ref } from "vue";
import * as XLSX from "xlsx";
import WordSort, { type WordSortQuestion } from "./components/words-sort.vue";

const wordSortRef = ref<InstanceType<typeof WordSort> | null>(null);
const STORAGE_KEY = "ielts-vocab-completed";

// 读取已完成题目的核心单词
const completedKeywords = ref<string[]>([]);
try {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    const parsed: unknown = JSON.parse(data);
    if (Array.isArray(parsed)) {
      completedKeywords.value = parsed.filter((item): item is string => typeof item === "string");
    }
  }
} catch (e) {
  console.error("Failed to load completed questions", e);
}

// 题目数组（改为从 Excel 加载）
const questionList = ref<WordSortQuestion[]>([]);
const currentIndex = ref(0);
const currentQuestion = computed<WordSortQuestion | undefined>(
  () => questionList.value[currentIndex.value]
);
const loading = ref(true);
const loadError = ref("");

// 从 public 目录加载 Excel 并解析
const loadQuestions = async () => {
  loading.value = true;
  loadError.value = "";
  try {
    const res = await axios.get(`${import.meta.env.BASE_URL}iets.xlsx`, {
      responseType: "arraybuffer",
    });
    const workbook = XLSX.read(res.data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error("Excel 中没有可用工作表");
    const data = XLSX.utils.sheet_to_json<WordSortQuestion>(sheet);
    questionList.value = data
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
  } catch (e) {
    console.error("Failed to load questions from Excel", e);
    loadError.value = "题目加载失败，请检查 iets.xlsx 文件";
    ElMessage.error(loadError.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadQuestions();
});

// 答对触发
const onSuccess = () => {
  if (!currentQuestion.value) return;

  ElMessage.success({
    message: "本题完成，可以进入下一题！",
    duration: 2000,
  });

  const keyword = currentQuestion.value.keyword;
  if (!completedKeywords.value.includes(keyword)) {
    completedKeywords.value.push(keyword);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedKeywords.value));
    } catch (e) {
      console.error("Failed to save completed questions", e);
      ElMessage.warning("本题已完成，但进度保存失败");
    }
  }
};

// 判断当前题是否已完成
const isCurrentCompleted = computed(() => {
  const question = currentQuestion.value;
  return question ? completedKeywords.value.includes(question.keyword) : false;
});

// 切换上一题
const prevQuestion = () => {
  if (!questionList.value.length) return;
  currentIndex.value -= 1;
  if (currentIndex.value < 0) {
    currentIndex.value = questionList.value.length - 1;
  }
};

// 随机切换下一题，避免抽到当前题目
const nextQuestion = () => {
  const total = questionList.value.length;
  if (total <= 1) return;

  const randomIndex = Math.floor(Math.random() * (total - 1));
  currentIndex.value = randomIndex >= currentIndex.value ? randomIndex + 1 : randomIndex;
};

// 重置当前题目
const resetCurrent = () => {
  wordSortRef.value?.reset();
};
</script>

<style scoped lang="less">
.english-words {
  --el-color-primary: #315e50;
  --el-color-primary-light-3: #6f9284;
  --el-color-primary-light-5: #9eb6ac;
  --el-color-primary-light-7: #ccd9d2;
  --el-color-primary-light-9: #eff4f0;
  --el-color-primary-dark-2: #24483d;
  --el-border-color: #dedfd7;
  --el-text-color-regular: #526059;

  min-height: 100vh;
  padding: 64px 32px 32px;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #283d34;
  background: radial-gradient(ellipse at 10% 0%, #e8eee5 0, transparent 45%), #f6f5f0;
  box-sizing: border-box;
}

.study-shell {
  max-width: 980px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 36px;
  gap: 24px;
}

.eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 3px;
  color: #698173;
}

h1 {
  margin: 18px 0 12px;
  font-family: "Songti SC", SimSun, serif;
  font-size: clamp(26px, 3vw, 36px);
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 1px;
}

h1 span {
  color: #6c8173;
}

.page-description {
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  color: #778077;
}

.course-label {
  flex-shrink: 0;
  padding: 10px 14px;
  font-size: 11px;
  letter-spacing: 1px;
  border: 1px solid #d9dfd4;
  border-radius: 30px;
}

.course-label span {
  margin: 0 6px;
  color: #a5afa3;
}

.study-card {
  padding: 28px 40px 24px;
  overflow: hidden;
  background: #fffefa;
  border: 1px solid #e3e5dc;
  border-radius: 20px;
  box-shadow: 0 12px 48px #354c3810;
}

.question-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 22px;
  border-bottom: 1px solid #ecece4;
}

.question-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.completion-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
  color: #697367;
  white-space: nowrap;
  background: #f5f5ef;
  border: 1px solid #e3e5dc;
  border-radius: 999px;
  gap: 5px;
}

.completion-badge.is-completed {
  color: #315e50;
  background: #edf5ee;
  border-color: #c8dbce;
}

.lesson-label {
  font-size: 12px;
  letter-spacing: 1px;
}

.lesson-label strong {
  font-size: 16px;
  font-variant-numeric: tabular-nums;
}

.toolbar-divider {
  margin: 0 16px;
  color: #c8cec3;
}

.total-count {
  font-size: 11px;
  color: #8a948a;
}

.practice-status {
  font-size: 11px;
  color: #758273;
}

.lesson-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 22px;
  border-top: 1px solid #ecece4;
  gap: 12px;
}

.navigation {
  display: flex;
  gap: 10px;
}

.navigation :deep(.el-button) {
  min-height: 42px;
  padding: 0 22px;
  margin: 0;
  border-radius: 9px;
}

.navigation span {
  margin-left: 16px;
}

.reset-button {
  color: #7a8379;
}

.page-note {
  margin: 24px 0 0;
  font-size: 11px;
  line-height: 1.8;
  letter-spacing: 1px;
  color: #7f887c;
  text-align: center;
}

.page-note span {
  margin: 0 10px;
}

.state-message {
  padding: 64px 12px;
  line-height: 1.8;
  color: #778077;
  text-align: center;
}

@media (width <= 600px) {
  .english-words {
    padding: 28px 14px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 22px;
  }

  .study-card {
    padding: 20px 18px;
    border-radius: 16px;
  }

  .navigation :deep(.el-button) {
    padding: 0 14px;
  }

  .toolbar-divider {
    margin: 0 8px;
  }
}
</style>
