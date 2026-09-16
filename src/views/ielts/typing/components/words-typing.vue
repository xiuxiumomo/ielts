<template>
  <div class="typing-practice">
    <QuestionPrompt :question="question" :completed="completed" @speak="speak" />
    <div class="typing-toolbar">
      <label class="section-label" for="typing-answer">听音打字 · 你的句子</label>
      <el-button text :aria-pressed="soundEnabled" @click="soundEnabled = !soundEnabled">
        按键音效：{{ soundEnabled ? "开" : "关" }}
      </el-button>
    </div>
    <p class="typing-hint">
      每条下划线代表一个字母，点击线段即可输入。单词间自动留空，无需输入空格或标点。
    </p>
    <form @submit.prevent="validate">
      <div class="letter-board" :class="{ 'is-success': isSuccess }" @click="focusInput()">
        <span
          v-for="(word, wordIndex) in expectedWords"
          :key="wordIndex"
          class="word-slots"
          aria-hidden="true"
        >
          <span
            v-for="(_, letterIndex) in word"
            :key="letterIndex"
            class="letter-slot"
            :class="{
              active: isFocused && !isSuccess && cursor === wordOffsets[wordIndex] + letterIndex,
              'caret-end':
                isFocused &&
                !isSuccess &&
                cursor === expectedLetters.length &&
                wordOffsets[wordIndex] + letterIndex === expectedLetters.length - 1,
            }"
            @click.stop="focusInput(wordOffsets[wordIndex] + letterIndex)"
          >
            {{ input[wordOffsets[wordIndex] + letterIndex] || "\u00a0" }}
          </span>
        </span>
        <input
          id="typing-answer"
          ref="inputRef"
          :value="input"
          class="typing-input"
          type="text"
          aria-label="在线段上输入英文句子"
          autocomplete="off"
          autocapitalize="off"
          :spellcheck="false"
          :disabled="isSuccess"
          :aria-invalid="Boolean(resultText && !isSuccess)"
          aria-describedby="typing-result"
          @input="onInput"
          @compositionend="onInput"
          @select="updateCursor"
          @keyup="updateCursor"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keydown="onKeydown"
        />
      </div>
      <div class="answer-actions">
        <span>{{ input.length }} / {{ expectedLetters.length }} 个字母</span>
        <el-button native-type="submit" type="primary" :disabled="isSuccess || !input.trim()"
          >检查答案</el-button
        >
      </div>
    </form>
    <p
      id="typing-result"
      class="result"
      :class="{ success: isSuccess, error: resultText && !isSuccess }"
      role="status"
      aria-live="polite"
    >
      {{ resultText || "先听一遍，再把句子打出来。完成后按回车检查。" }}
    </p>
    <p v-if="speechMessage" class="typing-hint" role="status">{{ speechMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useSpeech } from "@/composables/use-speech";
import { useTypingSound } from "@/composables/use-typing-sound";
import type { IPracticeQuestion } from "@/types/practice";
import { typingWords } from "../answer";
import QuestionPrompt from "@/components/question-prompt/index.vue";

const props = defineProps<{ question: IPracticeQuestion; completed?: boolean }>();
const emit = defineEmits<{ success: [] }>();
const input = ref("");
const inputRef = ref<HTMLInputElement | null>(null);
const cursor = ref(0);
const isFocused = ref(false);
const isSuccess = ref(false);
const resultText = ref("");
const { speak, speechMessage } = useSpeech();
const { soundEnabled, playKeySound } = useTypingSound();
const expectedWords = computed(() => typingWords(props.question.answer));
const expectedLetters = computed(() => expectedWords.value.join(""));
const wordOffsets = computed(() => {
  let offset = 0;
  return expectedWords.value.map((word) => {
    const start = offset;
    offset += word.length;
    return start;
  });
});
const updateCursor = () => {
  cursor.value = inputRef.value?.selectionStart ?? input.value.length;
};
const focusInput = (position = input.value.length) => {
  if (isSuccess.value) return;
  const index = Math.min(position, input.value.length);
  inputRef.value?.focus({ preventScroll: true });
  inputRef.value?.setSelectionRange(index, index);
  updateCursor();
};

const validate = () => {
  if (isSuccess.value) return;
  isSuccess.value = Boolean(expectedLetters.value) && input.value === expectedLetters.value;
  resultText.value = isSuccess.value
    ? "输入正确，本题已完成！"
    : "输入还不正确，请检查拼写和单词顺序，也可以再听一遍。";
  if (isSuccess.value) emit("success");
};

const onInput = (event: Event) => {
  resultText.value = "";
  if ((event as InputEvent).isComposing) return;
  const element = event.target as HTMLInputElement;
  const position = element.selectionStart ?? element.value.length;
  const normalizedPosition = element.value.slice(0, position).replace(/[^a-z]/gi, "").length;
  const previous = input.value;
  input.value = element.value
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .slice(0, expectedLetters.value.length);
  element.value = input.value;
  element.setSelectionRange(normalizedPosition, normalizedPosition);
  updateCursor();
  if (previous !== input.value) void playKeySound();
  if (input.value.length === expectedLetters.value.length) validate();
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
    validate();
  }
};

const reset = () => {
  input.value = "";
  cursor.value = 0;
  isSuccess.value = false;
  resultText.value = "";
  speak(props.question.answer);
  void nextTick(() => inputRef.value?.focus({ preventScroll: true }));
};
watch(() => props.question, reset, { immediate: true });
defineExpose({ reset });
</script>

<style scoped lang="less">
.section-label {
  font-size: 11px;
  letter-spacing: 1.5px;
  color: #75806e;
}

.typing-toolbar,
.answer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.typing-hint {
  font-size: 12px;
  line-height: 1.8;
  color: #778077;
}

.letter-board {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  min-height: 116px;
  padding: 20px;
  margin: 16px 0;
  cursor: text;
  background: #fafbf6;
  border: 1px dashed #bac9b4;
  border-radius: 12px;
  gap: 20px;
}

.word-slots {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 100%;
}

.letter-slot {
  position: relative;
  width: 16px;
  min-height: 28px;
  font-family: monospace;
  font-size: 21px;
  color: #315e50;
  text-align: center;
  border-bottom: 2px solid #b7c6a6;
}

.is-success {
  background: #f2f7ed;
  border-style: solid;
}

.typing-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  border: 0;
  opacity: 0;
}

.letter-board:focus-within {
  outline: 2px solid #537652;
  outline-offset: 2px;
}

.letter-slot.active {
  background: #e8f0df;
  border-bottom-color: #315e50;
}

.letter-slot.active::after,
.letter-slot.caret-end::after {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 0;
  width: 2px;
  pointer-events: none;
  background: #315e50;
  content: "";
  animation: typing-caret-blink 1s step-end infinite;
}

.letter-slot.caret-end::after {
  right: -3px;
  left: auto;
}

@keyframes typing-caret-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .letter-slot.active::after,
  .letter-slot.caret-end::after {
    animation: none;
  }
}

.answer-actions {
  margin-top: 14px;
  font-size: 12px;
  color: #758273;
}

.result {
  padding: 10px 14px;
  margin: 20px 0 24px;
  font-size: 13px;
  line-height: 1.8;
  color: #8a7961;
  background: #fff8ed;
  border: 1px solid #f0dfc1;
  border-radius: 8px;
}

.result.success {
  color: #236b39;
  background: #edf8ef;
  border-color: #b8ddbf;
}

.result.error {
  color: #9a5a1e;
  background: #fff1dc;
  border-color: #efc988;
}

@media (width <= 600px) {
  .letter-board {
    padding: 14px;
    gap: 16px;
  }
}
</style>
