import {createRouter, createWebHistory} from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue"
import Register from "@/views/Register.vue";
import UserInfo from "@/views/UserInfo.vue";

const isAuthenticated = () => {
    return localStorage.getItem("token") != null;
}
// 定义一些路由
// 每个路由都需要映射到一个组件。
const routes = [
    {
        path: "/", redirect: to => {
            if (!isAuthenticated()) {
                return "/login";
            }
            return {path: '/userInfo'}
        },
    },
    {path: "/home", component: Home},
    {path: "/login", component: Login, name: "Login"},
    {path: "/register", component: Register, name: "Register"},
    {path: "/userInfo", component: UserInfo}];

// 创建路由实例并传递 `routes` 配置
const router = createRouter({
    // 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHistory(),
    mode: history,
    routes, // `routes: routes` 的缩写
});

router.beforeEach(async (to, from) => {
    if (!isAuthenticated() && to.name !== 'Login' && to.name !== "Register") {
        // 将用户重定向到登录页面
        return {name: 'Login'}
    }
})

export default router;