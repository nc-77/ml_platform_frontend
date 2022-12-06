<template>
  <a-form :model="node" layout="vertical">
    <div class="form-label">{{ label }}</div>
    <a-form-item label="组件名称">
      <a-input v-model:value="name" @change="changeNodeName"></a-input>
    </a-form-item>
    <a-form-item label="组件参数">
      <a-input> </a-input>
    </a-form-item>
  </a-form>
</template>

<script>
import * as common from "./common";
export default {
  data() {
    return {
      label: "",
      name: "",
      status: "",
    };
  },
  props: ["node"],
  methods: {
    changeNodeName(e) {
      this.node.setData({ name: e.target.value }); 
    },
  },
  mounted() {
    common.mapper(this.node.data, this.$data);
  },
};
</script>

<style></style>
