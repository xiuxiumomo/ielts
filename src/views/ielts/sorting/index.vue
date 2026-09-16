<template>
  <PracticePage mode="sorting" @reset="practiceRef?.reset()">
    <template #default="{ question, completed, onSuccess }">
      <WordSort
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
import WordSort from "./components/words-sort.vue";

const practiceRef = ref<InstanceType<typeof WordSort> | null>(null);
</script>
