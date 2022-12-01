<template>
  <a-form :model="formState" layout="vertical">
    <div class="form-label">{{ formState.label }}</div>
    <a-form-item label="组件名称">
      <a-input
        v-model:value="formState.name"
        @change="changeNodeName"
      ></a-input>
    </a-form-item>
    <a-form-item label="组件参数">
      <a-input></a-input>
    </a-form-item>
  </a-form>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: ["formState"],
  emits: ["changeNodeName"],
  methods: {
    changeNodeName() {
      this.$emit("changeNodeName", this.formState.name);
    },
  },
};
</script>

<style>
.form-label {
  text-align: center;
  position: relative;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  padding: 0 5px 0 8px;
  color: #666;
  font-weight: 700;
  font-size: 12px;
  line-height: 32px;
  cursor: default;
  transition: all 0.3;
  border-bottom: 1px solid #d3dae5;
  margin-bottom: 12px;
}
.ant-form-item-label > label {
  height: 32px;
  font-size: 12px;
}
.ant-input {
  font-size: 12px;
}
.ant-form-item {
  padding-left: 10px;
  padding-right: 10px;
}
</style>
