<template>
  <a-form layout="vertical">
    <div class="form-label">{{ label }}</div>
    <a-form-item label="组件名称">
      <a-input v-model:value="name" @change="changeNodeName"></a-input>
    </a-form-item>
  </a-form>
</template>

<script>
import * as common from "@/components/common";

export default {
  name: "DataSetForm",
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
  methods: {
    changeNodeName(e) {
      this.node.setData({name: e.target.value});
    },
  }
}

</script>
