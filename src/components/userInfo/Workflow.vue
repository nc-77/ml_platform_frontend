<template>
  <div class="flex-between">
    <a-form layout="vertical">
      <a-form-item>
        <h3> 基本信息</h3>
      </a-form-item>
      <a-form-item label="工作流名称">
        123
      </a-form-item>
      <a-form-item label="工作流ID">
        123
      </a-form-item>
      <a-form-item label="创建时间">
        123
      </a-form-item>
      <a-form-item label="创建人(UID)">
        123
      </a-form-item>
      <a-form-item label="描述">
        123
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
    <a-button type="primary">进入工作流</a-button>
    <a-button>修改</a-button>
    <a-button danger>删除</a-button>
  </a-space>

</template>

<script>
export default {
  name: "Workflow"
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