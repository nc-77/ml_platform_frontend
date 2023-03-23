<template>
  <div class="flex-between">
    <a-form layout="vertical">
      <a-form-item>
        <h3> 基本信息</h3>
      </a-form-item>
      <a-form-item label="工作流名称">
        {{ workflow.workflowName }}
      </a-form-item>
      <a-form-item label="工作流ID">
        {{ workflow.id }}
      </a-form-item>
      <a-form-item label="创建时间">
        {{ workflow.createdAt }}
      </a-form-item>
      <a-form-item label="创建人(UID)">
        {{ workflow.userId }}
      </a-form-item>
      <a-form-item label="描述">
        {{ workflow.workflowDesc }}
      </a-form-item>
    </a-form>
    <div class="image-wrap">
      <span style="font-size: 12px">
        工作流示例
      </span>
      <a-image width="500px" src="src/assets/workflow.png" :preview=false></a-image>
    </div>
  </div>
  <a-space style=" margin-left: 34px;">
    <a-button type="primary" @click="toHome">进入工作流</a-button>
    <a-button @click="showUpdateForm = true">修改</a-button>
    <a-button danger @click="deleteVisible = true">删除</a-button>
  </a-space>

  <a-modal v-model:visible="showUpdateForm" title="修改工作流" ok-text="确定" cancel-text="取消" @ok="updateWorkflow">
    <update-workflow ref="updateForm" :form-state="workflow"></update-workflow>
  </a-modal>

  <a-modal v-model:visible="deleteVisible" title="删除工作流" ok-text="确定" cancel-text="取消" @ok="deleteWorkflow">
    <p>即将删除工作流{{ this.workflow.workflowName }}</p>
    <p>删除后无法恢复，确定删除吗？</p>
  </a-modal>

</template>

<script>
import {message} from "ant-design-vue";
import {getStatus} from "@/components/result";
import UpdateWorkflow from "@/components/userInfo/UpdateWorkflow.vue";

export default {
  name: "Workflow",
  components: {UpdateWorkflow},
  props: ["workflow"],
  emits: ["on-update","on-delete"],
  data() {
    return {
      showUpdateForm: false,
      deleteVisible: false,
    }
  },
  methods: {
    toHome(){
      this.$router.push("/home");
    },
    async updateWorkflow() {
      const formState = this.$refs.updateForm.newFormState;
      if (formState.workflowName.trim() === "") {
        message.error("工作流名称字段不能为空");
        return;
      }
      const res = await fetch("http://localhost:8081/workflow", {
        method: "POST",
        body: JSON.stringify({
          id: formState.id,
          workflowName: formState.workflowName,
          workflowDesc: formState.workflowDesc,
          userId: this.id,
        },),
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(res => res.json());
      const status = getStatus(res?.code);
      if (status === "success") {
        message.success("工作流修改成功");
        this.$emit("on-update");
      } else {
        message.error("工作流修改失败");
      }
      this.showUpdateForm = false;
    },
    async deleteWorkflow(){
      const res = await fetch("http://localhost:8081/workflow/" + this.workflow.id, {
        method: "DELETE",
      }).then(res => res.json());
      const status = getStatus(res?.code);
      if (status === "success") {
        message.success("工作流删除成功");
        this.$emit("on-delete");
      } else {
        message.error("工作流删除失败");
      }
      this.deleteVisible = false;
    }
  }
}
</script>

<style scoped>
.ant-form {
  margin-top: 18px;
  margin-bottom: 18px;
  margin-left: 24px;
}

.ant-row {
  margin-bottom: 12px;
}

.image-wrap {
  display: flex;
  flex-direction: column;
  margin-right: 200px;
}
</style>