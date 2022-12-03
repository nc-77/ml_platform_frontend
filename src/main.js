import { createApp } from "vue/dist/vue.esm-bundler";
import 'ant-design-vue/dist/antd.css';
import App from "./App.vue";
import router from "./router/router";

import "./assets/main.css";

createApp(App).use(router).mount("#app");
