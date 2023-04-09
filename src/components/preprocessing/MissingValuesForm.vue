<template>
  <a-form layout="vertical">
    <div class="form-label">{{ label }}</div>
    <a-form-item label="组件名称">
      <a-input v-model:value="name"></a-input>
    </a-form-item>
    <a-form-item label="原值">
      <a-select v-model:value="formState.originalValue">
        <a-select-option value="all" style="font-size: 12px">？和空字符（string）</a-select-option>
        <a-select-option value="onlyQMark" style="font-size: 12px">？（string）</a-select-option>
        <a-select-option value="onlyEmpty" style="font-size: 12px">空字符（string）</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="替换为">
      <a-select v-model:value="formState.replaceValue">
        <a-select-option value="mean" style="font-size: 12px">平均值（数值型）</a-select-option>
        <a-select-option value="max" style="font-size: 12px">出现最多的值（string）</a-select-option>
        <a-select-option value="remove" style="font-size: 12px">过滤所在行</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="saveForm">保存</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import * as common from "@/components/common";
import {missingValuesFormStore} from "@/store/form";
import {message} from "ant-design-vue";

export default {
  data() {
    return {
      label: "",
      name: "",
      formStore: "",
      formState: {
        originalValue: "all",
        replaceValue:"mean"
      },
    };
  },
  props: ["node"],
  created() {
    // 初始化数据绑定
    common.mapper(this.node.data, this.$data);
    // 初始化表单数据
    this.formStore = missingValuesFormStore();
    const formStateFormStore = this.formStore.getFormStateById(this.node.id);
    if (formStateFormStore) {
      this.formState = formStateFormStore;
    }
    this.node.setData({formState: this.formState});
  },
  methods: {
    saveForm() {
      this.node.setData({
        formState: this.formState
      });
      this.formStore.setFormStateById(this.node.id, this.formState);
      this.node.setData({name: this.name});
      message.success("保存成功");
    }
  }
}

</script>
