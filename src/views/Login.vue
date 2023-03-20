<template>
  <div class="main">
    <div class="top">
      <span class="title">机器学习可视化编程平台</span>
    </div>
    <a-form
        :model="formState"
        class="login-form"
    >
      <a-tabs activeKey="1"
              :tabBarStyle="{ textAlign: 'center', borderBottom: 'unset' }"
              :centered=true>
        <a-tab-pane key="1" tab="账户密码登录">
          <a-form-item
              name="username"
              :rules="[{ required: true, message: '请输入帐户名!' }]"
          >
            <a-input
                v-model:value="formState.username"
                :placeholder="'账户：admin'"
                size="large"
            >
              <template #prefix>
                <UserOutlined class="site-form-item-icon"/>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item
              name="password"
              :rules="[{ required: true, message: '请输入密码!' }]"
          >
            <a-input-password
                v-model:value="formState.password"
                :placeholder="'密码：admin'"
                size="large"
            >
              <template #prefix>
                <LockOutlined class="site-form-item-icon"/>
              </template>
            </a-input-password>
          </a-form-item>
          <a-form-item>
            <div class="forgetPwd">
              <a-checkbox v-model:checked="formState.remember">自动登录</a-checkbox>
              <a-button type="link">忘记密码</a-button>
            </div>

          </a-form-item>
          <a-form-item>
            <a-button :disabled="disabled" type="primary" html-type="submit" style="width: 100%" size="large"
                      @click=login
                      :loading=loadingBtn
            >
              登录
            </a-button>
          </a-form-item>
          <a-form-item>
            <div class="register">
              <a-button type="link" @click="this.$router.push('/register')">
                注册账户
              </a-button>
            </div>
          </a-form-item>
        </a-tab-pane>
      </a-tabs>
    </a-form>
  </div>
</template>
<script>
import {reactive, computed, ref} from 'vue';
import {UserOutlined, LockOutlined} from '@ant-design/icons-vue';
import {message} from "ant-design-vue";

export default {
  components: {
    UserOutlined,
    LockOutlined,
  },
  setup() {
    const formState = reactive({
      username: 'admin',
      password: 'admin',
      remember: false,
    });
    const loadingBtn = ref(false);
    const disabled = computed(() => {
      return !(formState.username && formState.password);
    });
    return {
      formState,
      disabled,
      loadingBtn
    };
  },
  methods: {
    login() {
      this.loadingBtn = true;
      if (this.formState.username === "admin" && this.formState.password === "admin") {
        this.$router.push("/home");
      } else {
        message.error("账户或密码错误");
      }
      this.loadingBtn = false;
    }
  }
};
</script>
<style scoped>
.main {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f0f2f5 url("../assets/background.svg");
}

.top {
  margin-bottom: 40px;
}

.title {
  font-size: 33px;
  color: rgba(0, 0, 0, .85);
  font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
  font-weight: 600;
  position: relative;
  top: 2px;
}

.login-form {
  width: 368px;
}

.register {
  display: flex;
  justify-content: flex-end;
}

.forgetPwd {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#components-form-demo-normal-login .login-form {
  max-width: 300px;
}

#components-form-demo-normal-login .login-form-forgot {
  float: right;
}

#components-form-demo-normal-login .login-form-button {
  width: 100%;
}
</style>