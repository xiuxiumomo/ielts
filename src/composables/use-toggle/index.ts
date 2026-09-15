/*
 * @Author: xiuxiumomo
 * @Date: 2024-09-10 09:23:19
 * @Last Modified by: xiuxiumomo
 * @Last Modified time: 2024-09-10 09:24:15
 * @Desc 可以初始化默认值的bool切换
 * @Example  const {state,toggle} = useToggle()
 */
import { ref } from "vue";
export function useToggle(defaultValue = false) {
  const state = ref(defaultValue);
  const toggle = (value = !state.value) => {
    state.value = value;
  };
  return { state, toggle };
}
