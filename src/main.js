import { createApp } from "vue/dist/vue.esm-bundler";
import { createPinia } from 'pinia';
import 'ant-design-vue/dist/antd.css';
import App from "./App.vue";
import router from "./router/router";

import "./assets/main.css";
import "./assets/form.css"

const pinia = createPinia()
const app = createApp(App)

app.use(pinia).use(router).mount("#app");
