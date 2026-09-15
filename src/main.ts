import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router/index";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "@/assets/less/index.less";

import "virtual:svg-icons-register";
import { createPinia } from "pinia";
import directives from "./directives";
const pinia = createPinia();
const app = createApp(App);
app.use(router);
app.use(ElementPlus);

app.use(pinia);
app.use(directives);
app.mount("#app");
