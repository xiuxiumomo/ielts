<template>
  <div class="word-sort">
    <QuestionPrompt :question="question" :completed="completed" @speak="speakAnswer" />

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
import { onBeforeUnmount, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";

export interface IWordItem {
  id: number;
  word: string;
}

import { useSpeech } from "@/composables/use-speech";
import type { IPracticeQuestion } from "@/types/practice";
import QuestionPrompt from "@/components/question-prompt/index.vue";

const props = defineProps<{
  question: IPracticeQuestion;
  completed?: boolean;
}>();
const emit = defineEmits<{ success: [] }>();

const sourceWords = ref<IWordItem[]>([]);
const targetWords = ref<IWordItem[]>([]);
const isSuccess = ref(false);
const resultText = ref("");

const { speak: speakAnswer } = useSpeech();
let validationTimer: ReturnType<typeof setTimeout> | undefined;

const initQuestion = (shouldSpeak = false) => {
  clearTimeout(validationTimer);
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
  clearTimeout(validationTimer);
});

const moveWordToTarget = (id: number) => {
  const index = sourceWords.value.findIndex((item) => item.id === id);
  if (index === -1) return;

  const [word] = sourceWords.value.splice(index, 1);
  targetWords.value.push(word);

  if (sourceWords.value.length === 0) {
    validationTimer = setTimeout(validateAnswer, 400);
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

.section-label {
  font-size: 11px;
  letter-spacing: 1.5px;
  color: #75806e;
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
