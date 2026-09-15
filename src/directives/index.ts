// import numberInput from "./number-input";

// import ClickOutside from "./click-outside";

// clickoutside详见 https://vueuse.org/core/onClickOutside/ 这个封装的好，项目中已经安装@vueuse/core
import { App } from "vue";
import preventReclick from "./prevent-reclick";
export { preventReclick };

const directives: Record<string, any> = {
  preventReclick,
};
//暴露install方法
export default {
  install(app: App) {
    Object.keys(directives).forEach((key) => {
      app.directive(key, directives[key]);
    });
  },
};
