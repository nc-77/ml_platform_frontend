<template>
  <a-form layout="vertical">
    <a-form-item label="工作流名称" :rules="[{ required: true, message: '工作流名称是必填字段' }]">
      <a-input v-model:value="newFormState.workflowName"></a-input>
    </a-form-item>
    <a-form-item label="工作流描述">
      <a-textarea v-model:value="newFormState.workflowDesc" show-count :maxlength="256"/>
    </a-form-item>
  </a-form>
</template>

<script>
import {deepCopy} from "@/components/common";

export default {
  name: "UpdateWorkflow",
  props:["formState"],
  data(){
    return {
      newFormState:{},
    }
  },
  mounted() {
    this.newFormState = deepCopy(this.formState);
  }
}
</script>

<style scoped>

</style>