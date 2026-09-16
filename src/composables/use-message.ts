import { getCurrentInstance } from "vue";

/** Access Element Plus services installed by app.use(ElementPlus). */
export function useMessage() {
  const instance = getCurrentInstance();
  if (!instance) throw new Error("useMessage must be called during setup");
  return instance.appContext.config.globalProperties.$message;
}
