<template>
  <a-form layout="vertical">
    <div class="form-label">{{ label }}</div>
    <a-form-item label="组件名称">
      <a-input v-model:value="name"></a-input>
    </a-form-item>
    <a-form-item label="原回归值">
      <a-select
          v-model:value="formState.classIndex"
          :options="fieldList"
      ></a-select>
    </a-form-item>
    <a-form-item label="预测回归值">
      <a-input v-model:value="formState.predictionScore"></a-input>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="saveForm">保存</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import * as common from "@/components/common";
import {graphStore, linerFormStore} from "@/store/form";
import {message} from "ant-design-vue";

export default {
  data() {
    return {
      label: "",
      name: "",
      formStore: "",
      formState: {
        classIndex:"",
        predictionScore:"prediction_score",
      },
      fieldList: [],
    };
  },
  props: ["node"],
  mounted() {
    // 初始化数据绑定
    common.mapper(this.node.data, this.$data);
    // 初始化表单数据
    this.formStore = linerFormStore();
    const formStateFormStore = this.formStore.getFormStateById(this.node.id);
    if (formStateFormStore) {
      this.formState = formStateFormStore;
    }
    const graph = graphStore().graph;
    // 初始化输入数据集字段
    const inputFile = common.getInputFile(this.node, graph);
    this.getFileFieldList(inputFile?.fileId).then(fieldList => {
      fieldList?.forEach(field => {
        this.fieldList.push({
          "value": field,
        })
      })
    });
    this.node.setData({formState: this.formState});
  },
  methods:{
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
  }
}

</script>
