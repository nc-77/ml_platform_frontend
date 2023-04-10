<template>
  <a-form layout="vertical">
    <div class="form-label">{{ label }}</div>
    <a-form-item label="组件名称">
      <a-input v-model:value="name"></a-input>
    </a-form-item>
    <a-form-item label="选择标签列（默认最后一列）">
      <a-select
          v-model:value="formState.classIndex"
          :options="fieldList"
      ></a-select>
    </a-form-item>
    <a-form-item label="近邻个数">
      <a-input-number v-model:value="formState.kNumber" style="width: 100%"></a-input-number>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="saveForm">保存</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import * as common from "@/components/common";
import {graphStore, knnFormStore, linerFormStore} from "@/store/form";
import {message} from "ant-design-vue";

export default {
  data() {
    return {
      label: "",
      name: "",
      formStore: "",
      formState: {
        classIndex: "",
        kNumber: 5,
      },
      fieldList: [],
    };
  },
  props: ["node"],
  created() {
    // 初始化数据绑定
    common.mapper(this.node.data, this.$data);
    // 初始化表单数据
    this.formStore = knnFormStore();
    const formStateFormStore = this.formStore.getFormStateById(this.node.id);
    if (formStateFormStore) {
      this.formState = formStateFormStore;
    }
    this.formStore.setFormStateById(this.node.id, this.formState);
    this.node.setData({formState: this.formState});
  },
  mounted() {
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
      this.node.setData({
        formState: this.formState
      });
      this.formStore.setFormStateById(this.node.id, this.formState);
      this.node.setData({name: this.name});
      console.log(this.node.data);
      message.success("保存成功");
    },
    getFileFieldList(fileId) {
      return fetch("http://localhost:8081/files/" + fileId + "/fieldList", {
        method: "GET"
      }).then(res => res.json()).then(res => res.data);
    },
  },
}

</script>