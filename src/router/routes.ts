import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: () => import("@/views/ielts/sorting/index.vue") },
  { path: "/typing", name: "typing", component: () => import("@/views/ielts/typing/index.vue") },
  { path: "/:pathMatch(.*)*", name: "NotFund", component: () => import("@/views/404.vue") },
];
