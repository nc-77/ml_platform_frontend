<template>
  <a-form layout="vertical">
    <a-form-item label="工作流名称" :rules="[{ required: true, message: '工作流名称是必填字段' }]">
      <a-input v-model:value="formState.workflowName"></a-input>
    </a-form-item>
    <a-form-item label="工作流描述">
      <a-textarea v-model:value="formState.workflowDesc" show-count :maxlength="256"/>
    </a-form-item>
  </a-form>
</template>

<script>
export default {
  name: "AddWorkflow",
  data() {
    return {
      formState: {
        workflowName: "",
        workflowDesc: "",
      }
    }
  },
  methods: {
    formReset() {
      this.formState = {
        workflowName: "",
        workflowDesc: "",
      }
    }
  }
}
</script>

<style scoped>

</style>