<template>
  <div class="main">
    <div class="top">
      <span class="title">机器学习可视化编程平台</span>
      <span class="subTitle">Machine learning visual programming platform</span>
    </div>
    <a-form
        :model="formState"
        :rules="rules"
        class="login-form"
    >
      <a-form-item>
        <h3>注册</h3>
      </a-form-item>

      <a-form-item
          name="username"
          :rules="[{ required: true, message: '请输入帐户名!' }]"
      >
        <a-input
            v-model:value="formState.username"
            :placeholder="'帐户名'"
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
            :placeholder="'密码'"
            size="large"
        >
          <template #prefix>
            <LockOutlined class="site-form-item-icon"/>
          </template>
        </a-input-password>

      </a-form-item>

      <a-form-item
          name="checkPass"
      >
        <a-input-password
            name="checkPass"
            v-model:value="formState.checkPass"
            :placeholder="'确认密码'"
            size="large"
        >
          <template #prefix>
            <LockOutlined class="site-form-item-icon"/>
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <div class="flex-between">
          <a-button :disabled="disabled" type="primary" html-type="submit" size="large"
                    :loading=loadingBtn
                    class="register-btn"
                    @click="register"
          >
            注册
          </a-button>

          <a-button type="link" size="large" @click="this.$router.push('/login')">
            使用已有帐户登录
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import {reactive, computed, ref} from 'vue';
import {UserOutlined, LockOutlined} from '@ant-design/icons-vue';
import md5 from 'js-md5';
import {getStatus} from "@/components/result";
import {message} from "ant-design-vue";

export default {
  components: {
    UserOutlined,
    LockOutlined,
  },
  setup() {
    const formState = reactive({
      username: '',
      password: '',
      checkPass: '',
    });
    const loadingBtn = ref(false);
    const disabled = computed(() => {
      return !(formState.username && formState.password && formState.checkPass === formState.password);
    });
    let validatePass = async (_rule, value) => {
      if (value === '') {
        return Promise.reject('请再次输入密码');
      } else if (value !== formState.password) {
        return Promise.reject("两次密码不一致");
      } else {
        return Promise.resolve();
      }
    };
    const rules = {
      checkPass: [{
        validator: validatePass,
        trigger: 'change',
      }],
    };
    return {
      formState,
      disabled,
      loadingBtn,
      rules
    };
  },
  methods: {
    async register() {
      this.loadingBtn = true;
      const postData = {
        username: this.formState.username,
        password: md5(this.formState.password),
      }
      const res = await fetch("http://localhost:8081/user/register", {
        method: "POST",
        body: JSON.stringify(postData),
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(res => res.json());
      const status = getStatus(res.code);
      if (status === "success") {
        message.success("注册成功");
        localStorage.setItem("token",res.data?.uid);
        this.$router.push("/userInfo/" + res.data?.uid);
      }else{
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
  display: flex;
  flex-direction: column;
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

.subTitle {
  font-size: 14px;
  color: rgba(0, 0, 0, .45);
  text-align: center;
}

.login-form {
  width: 368px;
}

.register-btn {
  width: 140px;
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