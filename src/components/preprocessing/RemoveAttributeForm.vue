<template>
  <a-form layout="vertical">
    <div class="form-label">{{ label }}</div>
    <a-form-item label="组件名称">
      <a-input v-model:value="name"></a-input>
    </a-form-item>
    <a-form-item label="过滤列">
      <a-select
          v-model:value="formState.removeIndices"
          mode="multiple"
          :options="fieldList"
      ></a-select>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="saveForm">保存</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import * as common from "@/components/common";
import {graphStore, removeAttributeFormStore} from "@/store/form";
import {message} from "ant-design-vue";

export default {
  data() {
    return {
      label: "",
      name: "",
      formStore: "",
      formState: {
        removeIndices: [],
      },
      fieldList: [],
    };
  },
  props: ["node"],
  created() {
    // 初始化数据绑定
    common.mapper(this.node.data, this.$data);
    // 初始化表单数据
    this.formStore = removeAttributeFormStore();
    const formStateFormStore = this.formStore.getFormStateById(this.node.id);
    if (formStateFormStore) {
      this.formState = formStateFormStore;
    }
    this.node.setData({formState: this.formState});

    const graph = graphStore().graph;
    // 初始化输入数据集字段
    const inputFile = common.getInputFile(this.node, graph);
    if (!common.isEmpty(inputFile)){
      this.getFileFieldList(inputFile?.fileId).then(fieldList => {
        fieldList?.forEach(field => {
          this.fieldList.push({
            "value": field,
          })
        })
      });
    }
  },
  methods: {
    saveForm() {
      const originData = this.node.data;
      originData.formState = this.formState;
      this.node.setData(originData, {overwrite: true});
      this.formStore.setFormStateById(this.node.id, this.formState);
      this.node.setData({name: this.name});
      message.success("保存成功");
      console.log(this.node.getData().formState);

    },
    getFileFieldList(fileId) {
      return fetch("http://localhost:8081/files/" + fileId + "/fieldList", {
        method: "GET"
      }).then(res => res.json()).then(res => res.data);
    },
  }
}

</script>
