<!-- components/WordSort.vue -->
<template>
  <div class="word-sort">
    <!-- 核心单词信息卡 -->
    <div class="keyword-card" :class="{ completed: props.completed }">
      <div class="keyword-main">
        <span class="keyword-word">{{ props.question.keyword }}</span>
        <span class="keyword-phonetic">/{{ props.question.phonetic }}/</span>
        <ElButton
          class="keyword-speak"
          type="primary"
          circle
          size="small"
          aria-label="朗读当前单词"
          @click="speakAnswer(props.question.keyword)"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <path d="M11 5 6 9H3v6h3l5 4V5Z M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
          </svg>
        </ElButton>
      </div>
      <div class="keyword-right">
        <span class="keyword-chinese">{{ props.question.chinese }}</span>
        <span v-if="props.completed" class="completed-badge">已完成</span>
      </div>
    </div>

    <div class="tip">
      <div>
        <span class="section-label">语境提示</span>
        <p class="tip-example">{{ props.question.example }}</p>
      </div>
      <ElButton class="speak-button" type="primary" plain @click="speakAnswer(answerText)">
        <svg
          class="speak-icon"
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="m9 5 10 7-10 7V5Z" />
        </svg>
        再听一遍
      </ElButton>
    </div>

    <!-- 目标容器 放拼好的句子 -->
    <div class="section-heading sentence-heading">
      <span class="section-label">你的句子</span>
      <span class="drag-hint">试着拖动词块调整顺序</span>
    </div>
    <VueDraggable
      v-model="targetWords"
      tag="div"
      class="target-box"
      :class="{ disabled: isSuccess }"
      :disabled="isSuccess"
      :aria-disabled="isSuccess"
      :group="{ name: 'wordGroup', pull: true, put: true }"
      :animation="150"
      @end="onDragEnd"
    >
      <div v-for="item in targetWords" :key="item.id" class="word-item target-word">
        {{ item.word }}
      </div>
      <span v-if="targetWords.length === 0" class="placeholder"
        >点击下方单词，在这里拼出完整句子</span
      >
    </VueDraggable>

    <!-- 源单词池（仅点击，不支持拖拽） -->
    <div class="section-heading">
      <span class="section-label">待选单词</span><span>{{ sourceWords.length }} 个待选</span>
    </div>
    <div class="source-box">
      <div
        v-for="item in sourceWords"
        :key="item.id"
        class="word-item source-word"
        role="button"
        tabindex="0"
        @click="moveWordToTarget(item.id)"
        @keydown.enter.space.prevent="moveWordToTarget(item.id)"
      >
        {{ item.word }}
      </div>
      <span v-if="sourceWords.length === 0" class="placeholder"
        >单词已全部选入，可在上方调整顺序</span
      >
    </div>

    <div
      class="result"
      :class="{ success: isSuccess, error: resultText && !isSuccess }"
      role="status"
      aria-live="polite"
    >
      <span v-if="isSuccess" class="result-icon" aria-hidden="true">✓</span>
      <span v-else-if="resultText" class="result-icon" aria-hidden="true">!</span>
      {{ resultText || "按顺序选择单词，完成后将自动检查答案。" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from "element-plus";
import { onBeforeUnmount, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";

export interface WordItem {
  id: number;
  word: string;
}

export interface WordSortQuestion {
  answer: string;
  keyword: string;
  chinese: string;
  phonetic: string;
  example: string;
}

const props = defineProps<{
  question: WordSortQuestion;
  completed?: boolean;
}>();
const emit = defineEmits<{ success: [] }>();

const sourceWords = ref<WordItem[]>([]);
const targetWords = ref<WordItem[]>([]);
const isSuccess = ref(false);
const resultText = ref("");
const answerText = ref("");

const speakAnswer = (text: string) => {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};

const initQuestion = (shouldSpeak = false) => {
  if (!props.question || !props.question.answer) return;

  const words = props.question.answer.trim().split(/\s+/);
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  const arr = words.map((word, idx) => ({
    id: Date.now() + idx,
    word,
  }));
  sourceWords.value = arr;
  targetWords.value = [];
  isSuccess.value = false;
  resultText.value = "";
  answerText.value = props.question.answer;

  if (shouldSpeak) {
    speakAnswer(props.question.answer);
  }
};

watch(
  () => props.question,
  () => initQuestion(true),
  { immediate: true, deep: true }
);

defineExpose({ reset: () => initQuestion() });

onBeforeUnmount(() => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
});

const moveWordToTarget = (id: number) => {
  const index = sourceWords.value.findIndex((item) => item.id === id);
  if (index === -1) return;

  const [word] = sourceWords.value.splice(index, 1);
  targetWords.value.push(word);

  if (sourceWords.value.length === 0) {
    setTimeout(validateAnswer, 400);
  }
};

const onDragEnd = () => {
  if (sourceWords.value.length === 0) {
    validateAnswer();
  }
};

const validateAnswer = () => {
  if (sourceWords.value.length > 0) {
    resultText.value = "";
    isSuccess.value = false;
    return;
  }

  const userSentence = targetWords.value.map((item) => item.word).join(" ");
  const success = userSentence === props.question.answer;

  resultText.value = success
    ? "排序正确，新的表达又记住了一点。"
    : "还差一点，试着拖动词块调整顺序。";

  if (success && !isSuccess.value) {
    emit("success");
  }
  isSuccess.value = success;
};
</script>
<style lang="less" scoped>
.word-sort {
  width: 100%;
}

.keyword-card {
  padding: 34px 0 28px;
}

.keyword-main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.keyword-word {
  max-width: 100%;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -1px;
  color: #294b3e;
  overflow-wrap: anywhere;
}

.keyword-phonetic {
  font-family: "Segoe UI", sans-serif;
  font-size: 15px;
  color: #7c887d;
}

.keyword-speak {
  width: 32px;
  height: 32px;
  margin: 0;
  color: #456653;
  background: #edf2e9;
  border-color: #e0e8db;
}

.keyword-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.keyword-chinese {
  font-size: 14px;
  line-height: 1.7;
  color: #657161;
}

.completed-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 11px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: #3d8b52;
  border-radius: 999px;
  box-shadow: 0 2px 6px #3d8b5240;
}

.tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  margin-bottom: 28px;
  background: #f4f5ed;
  border-left: 3px solid #b7c6a6;
  border-radius: 0 10px 10px 0;
  gap: 20px;
}

.section-label {
  font-size: 11px;
  letter-spacing: 1.5px;
  color: #75806e;
}

.tip-example {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.9;
  color: #495744;
  overflow-wrap: anywhere;
}

.speak-button {
  flex-shrink: 0;
  height: 34px;
  font-size: 12px;
  background: transparent;
  border-color: #d7dfce;
  border-radius: 7px;
}

.speak-icon {
  margin-right: 6px;
}

.drag-hint {
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #8b5d28;
  background: #fff4df;
  border: 1px solid #f0d39f;
  border-radius: 6px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  margin-bottom: 12px;
  font-size: 11px;
  color: #858d80;
  gap: 12px;
}

.target-box {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  align-items: center;
  min-height: 116px;
  padding: 20px;
  margin-bottom: 24px;
  background: #fafbf6;
  border: 1px dashed #bac9b4;
  border-radius: 12px;
  box-sizing: border-box;
  gap: 9px;
}

.target-box.disabled {
  background: #f2f7ed;
  border-color: #96b19a;
  border-style: solid;
}

.target-box.disabled .word-item {
  cursor: default;
}

.source-box {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  align-items: center;
  min-height: 70px;
  padding: 4px 0;
  gap: 10px;
}

.placeholder {
  font-size: 12px;
  line-height: 1.8;
  color: #87907f;
}

.word-item {
  max-width: 100%;
  padding: 10px 16px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 18px;
  line-height: 24px;
  border-radius: 7px;
  box-sizing: border-box;
  user-select: none;
  overflow-wrap: anywhere;
}

.source-word {
  min-height: 44px;
  color: #465341;
  cursor: pointer;
  background: #fffefa;
  border: 1px solid #e1e3d8;
  box-shadow: 0 2px 0 #e9eadf;
  transition: background 0.18s, border-color 0.18s, transform 0.18s;
}

.source-word:hover {
  background: #f0f4e9;
  border-color: #aebfa0;
  transform: translateY(-2px);
}

.source-word:focus-visible {
  outline: 2px solid #537652;
  outline-offset: 3px;
}

.target-word {
  color: #31553f;
  cursor: grab;
  background: #e8f0df;
  border: 1px solid #d0ddc5;
  box-shadow: 0 2px 0 #dce6d1;
}

.target-word:active {
  cursor: grabbing;
}

.result {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;
  padding: 10px 14px;
  margin: 20px 0 24px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.8;
  color: #8a7961;
  background: #fff8ed;
  border: 1px solid #f0dfc1;
  border-radius: 8px;
}

.result-icon {
  display: inline-grid;
  width: 20px;
  height: 20px;
  font-size: 13px;
  color: #fff;
  background: #bc7a2d;
  border-radius: 50%;
  place-items: center;
}

.result.success {
  color: #236b39;
  background: #edf8ef;
  border-color: #b8ddbf;
}

.result.success .result-icon {
  background: #3d8b52;
}

.result.error {
  color: #9a5a1e;
  background: #fff1dc;
  border-color: #efc988;
}

@media (width <= 600px) {
  .keyword-card {
    padding: 26px 0 22px;
  }

  .keyword-main {
    gap: 12px;
  }

  .tip {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap: 12px;
  }

  .target-box {
    padding: 14px;
  }

  .word-item {
    padding: 8px 12px;
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .source-word {
    transition: none;
  }
}
</style>
