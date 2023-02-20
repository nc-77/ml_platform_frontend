<template>
  <a-form layout="vertical">
    <div class="form-label">{{ label }}</div>
    <a-form-item label="组件名称">
      <a-input v-model:value="name"></a-input>
    </a-form-item>
  </a-form>
</template>

<script>
import * as common from "@/components/common";

export default {
  data() {
    return {
      label: "",
      name: "",
    };
  },
  props: ["node"],
  mounted() {
    // 初始化数据绑定
    common.mapper(this.node.data, this.$data);
  },
}

</script>
