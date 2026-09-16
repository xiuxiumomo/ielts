<template>
  <div class="keyword-card">
    <div class="keyword-main">
      <span class="keyword-word">{{ question.keyword }}</span>
      <span v-if="question.phonetic" class="keyword-phonetic">/{{ question.phonetic }}/</span>
      <el-button
        @click="emit('speak', question.keyword)"
        class="keyword-speak"
        type="primary"
        circle
        size="small"
        aria-label="朗读当前单词"
        >▶</el-button
      >
    </div>
    <div class="keyword-right">
      <span class="keyword-chinese">{{ question.chinese }}</span>
      <span v-if="completed" class="completed-badge">已完成</span>
    </div>
  </div>
  <div class="tip">
    <div>
      <span class="section-label">语境提示</span>
      <p class="tip-example">{{ question.example }}</p>
    </div>
    <el-button @click="emit('speak', question.answer)" class="speak-button" type="primary" plain
      >再听一遍</el-button
    >
  </div>
</template>

<script setup lang="ts">
import type { IPracticeQuestion } from "@/types/practice";
defineProps<{ question: IPracticeQuestion; completed?: boolean }>();
const emit = defineEmits<{ speak: [text: string] }>();
</script>

<style lang="less" scoped>
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
  line-height: 1.2;
  color: #294b3e;
  overflow-wrap: anywhere;
}

.keyword-phonetic {
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
  padding: 5px 11px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: #3d8b52;
  border-radius: 999px;
}

.tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 24px;
  margin-bottom: 28px;
  background: #f4f5ed;
  border-left: 3px solid #b7c6a6;
  border-radius: 0 10px 10px 0;
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
}
</style>
