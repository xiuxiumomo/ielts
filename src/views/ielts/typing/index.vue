<template>
  <PracticePage mode="typing" @reset="practiceRef?.reset()">
    <template #default="{ question, completed, onSuccess }">
      <WordTyping
        ref="practiceRef"
        :question="question"
        :completed="completed"
        @success="onSuccess"
      />
    </template>
  </PracticePage>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PracticePage from "../shared/practice-page.vue";
import WordTyping from "./components/words-typing.vue";

const practiceRef = ref<InstanceType<typeof WordTyping> | null>(null);
</script>
