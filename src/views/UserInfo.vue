<template>
  <a-layout>
    <a-layout-header class="header-wrap">
      <div class="flex-between">
        <a-page-header
            title="机器学习可视化编程平台"
            sub-title="Machine learning visual programming platform"
        />
          <a-dropdown-button class="avatar-wrap">
            {{ username }}
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="logout">
                  <LoginOutlined />
                  登出
                </a-menu-item>
              </a-menu>
            </template>
            <template #icon><UserOutlined /></template>
          </a-dropdown-button>


      </div>

    </a-layout-header>
    <a-layout>
      <a-layout-sider theme="light" width="20%">
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="1" tab="工作流列表">
            <a-button type="primary" style="font-size: 12px">新建工作流</a-button>
            <a-collapse v-model:activeKey="collapseActive" :bordered="false" style="font-size: 12px">
              <a-collapse-panel key="1">
                <template #header>
                  <folder-open-two-tone style="margin-right: 6px;font-size: 16px;"/>
                  我的工作流
                </template>
                <p>农业贷款预测的回归算法实现</p>
                <p>农业贷款预测的回归算法实现</p>
                <p>农业贷款预测的回归算法实现</p>
              </a-collapse-panel>
            </a-collapse>
          </a-tab-pane>
        </a-tabs>
      </a-layout-sider>
      <a-layout-content>
        <a-layout-header class="header-wrap" style="height: 46px"></a-layout-header>
        <workflow></workflow>
      </a-layout-content>
    </a-layout>
  </a-layout>


</template>

<script>
import {FolderOpenTwoTone, UserOutlined,LoginOutlined} from '@ant-design/icons-vue';
import Workflow from "@/components/userInfo/Workflow.vue";

export default {
  name: "UserInfo",
  components: {
    Workflow,
    FolderOpenTwoTone,
    UserOutlined,
    LoginOutlined
  },
  data() {
    return {
      id: localStorage.getItem("token"),
      username: "admin",
      activeKey: "1",
      collapseActive: "1",
      workflows: [],
    }
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push("/login");
    }
  }
}
</script>

<style scoped>
.header-wrap {
  background-color: white;
  padding: 0;
}

.avatar-wrap {
  margin-left: 12px;
  margin-right: 12px;
}

.ant-tabs {
  padding-left: 24px;
}

.ant-collapse-item {
  background-color: white;
  border: 0;
}


</style>