<template>
  <a-layout>
    <a-layout-header class="header-wrap">
      <div class="flex-between">
        <a-page-header
            title="机器学习可视化编程平台"
            sub-title="Machine learning visual programming platform"
        />
        <a-dropdown-button class="avatar-wrap">
          {{ user.username }}
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="logout">
                <LoginOutlined/>
                登出
              </a-menu-item>
            </a-menu>
          </template>
          <template #icon>
            <UserOutlined/>
          </template>
        </a-dropdown-button>


      </div>

    </a-layout-header>
    <a-layout>
      <a-layout-sider theme="light" width="20%">
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="1" tab="工作流列表">
            <a-button type="primary" style="font-size: 12px"
                      @click="showAddForm=true">新建工作流
            </a-button>
            <a-collapse v-model:activeKey="collapseActive" :bordered="false" style="font-size: 12px">
              <a-collapse-panel key="1">
                <template #header>
                  <folder-open-two-tone style="margin-right: 6px;font-size: 16px;"/>
                  我的工作流
                </template>
                <a-list :data-source="workflows">
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <a-button type="text" @click="currentWorkflow=item">
                        <template #icon>
                          <experiment-outlined/>
                        </template>
                        {{ item.workflowName }}
                      </a-button>
                    </a-list-item>
                  </template>
                </a-list>
              </a-collapse-panel>
            </a-collapse>
          </a-tab-pane>
        </a-tabs>
      </a-layout-sider>
      <a-layout-content>
        <a-layout-header class="header-wrap" style="height: 46px"></a-layout-header>
        <workflow v-if="!isEmpty(currentWorkflow)"
                  :workflow="currentWorkflow"
                  @on-update="reloadWorkflows"
                  @on-delete="reloadWorkflows">
        </workflow>
      </a-layout-content>
    </a-layout>
  </a-layout>

  <a-modal v-model:visible="showAddForm" title="新建工作流" ok-text="确定" cancel-text="取消" @ok="addWorkflow">
    <add-workflow ref="addForm"></add-workflow>
  </a-modal>


</template>

<script>
import {FolderOpenTwoTone, UserOutlined, LoginOutlined, ExperimentOutlined} from '@ant-design/icons-vue';
import Workflow from "@/components/userInfo/Workflow.vue";
import AddWorkflow from "@/components/userInfo/AddWorkflow.vue";
import {getStatus} from "@/components/result";
import {message} from "ant-design-vue";
import UpdateWorkflow from "@/components/userInfo/UpdateWorkflow.vue";
import workflow from "@/components/userInfo/Workflow.vue";
import {isEmpty} from "@/components/common";

export default {
  name: "UserInfo",
  components: {
    UpdateWorkflow,
    AddWorkflow,
    Workflow,
    FolderOpenTwoTone,
    UserOutlined,
    LoginOutlined,
    ExperimentOutlined
  },
  data() {
    return {
      id: localStorage.getItem("token"),
      activeKey: "1",
      collapseActive: "1",
      user: {},
      workflows: [],
      currentWorkflow: "",
      showAddForm: false,
    }
  },
  async mounted() {
    this.user = await this.getUserInfo();
    this.workflows = await this.getWorkflows();
  },
  methods: {
    isEmpty,
    async getUserInfo() {
      const res = await fetch("http://localhost:8081/user/" + this.id, {
        method: "GET",
      }).then(res => res.json());
      return res?.data;
    },
    async getWorkflows() {
      const res = await fetch("http://localhost:8081/workflows?userId=" + this.id, {
        method: "GET",
      }).then(res => res.json());
      return res?.data;
    },
    async reloadWorkflows() {
      this.workflows = await this.getWorkflows();
      this.currentWorkflow = this.workflows.find(workflow => workflow.id === this.currentWorkflow.id);
    },
    async addWorkflow() {
      const formState = this.$refs.addForm.formState;
      if (formState.workflowName.trim() === "") {
        message.error("工作流名称字段不能为空");
        return;
      }
      const res = await fetch("http://localhost:8081/workflow", {
        method: "POST",
        body: JSON.stringify({
          workflowName: formState.workflowName,
          workflowDesc: formState.workflowDesc,
          userId: this.id,
        },),
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(res => res.json());
      const status = getStatus(res?.code);
      status === "success" ? message.success("工作流创建成功") : message.error("工作流创建失败");
      this.showAddForm = false;
      this.$refs.addForm.formReset();
      this.workflows = await this.getWorkflows();
    },

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

.ant-list-item {
  border: 0;
  padding: 0 0 0 14px;
}


</style>