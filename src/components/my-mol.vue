<template>
  <div>
    <el-button type="primary" @click="handlerClick">点击</el-button>
    <div>当前数据1：{{ num1 }}</div>
    <div>当前数据2：{{ num2 }}</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MyMol" });
//https://cn.vuejs.org/guide/components/v-model.html 直接定义v-model
const num1 = defineModel("num1", { default: 0 });
const num2 = defineModel("num2", { default: 2 });
const handlerClick = () => {
  num1.value++;
  num2.value += 2;
};
</script>
