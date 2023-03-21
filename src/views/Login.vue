<template>
  <div class="main">
    <div class="top">
      <span class="title">机器学习可视化编程平台</span>
      <span class="subTitle">Machine learning visual programming platform</span>
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
import md5 from "js-md5";
import {getStatus} from "@/components/result";

export default {
  name: "Login",
  components: {
    UserOutlined,
    LockOutlined,
  },
  setup() {
    const formState = reactive({
      username: 'admin',
      password: 'admin',
      remember: true,
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
    async login() {
      this.loadingBtn = true;
      const postData = {
        username: this.formState.username,
        password: md5(this.formState.password),
      }
      const res = await fetch("http://localhost:8081/user/login", {
        method: "POST",
        body: JSON.stringify(postData),
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(res => res.json());
      const status = getStatus(res.code);
      if (status === "success") {
        localStorage.setItem("token",res.data?.uid);
        this.$router.push("/userInfo/" + res.data?.uid);
      } else {
        message.error(res.message);
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
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 33px;
  color: rgba(0, 0, 0, .85);
  font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
  font-weight: 600;
  position: relative;
  top: 2px;
}

.subTitle {
  font-size: 14px;
  color: rgba(0, 0, 0, .45);
  text-align: center;
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