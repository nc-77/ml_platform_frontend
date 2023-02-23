<template>
  <a-form layout="vertical">
    <div class="form-label">{{ label }}</div>
    <a-form-item label="组件名称">
      <a-input v-model:value="name" @change="changeNodeName"></a-input>
    </a-form-item>
    <a-form-item label="划分方式">
      <a-select v-model:value="formState.selectMethod">
        <a-select-option value="按比例划分" style="font-size: 12px">按比例划分</a-select-option>
        <a-select-option value="按阈值划分" style="font-size: 12px">按阈值划分</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="划分比例（表1占原数据的比例）" v-if="formState.selectMethod==='按比例划分'">
      <a-space>
        <a-input-number v-model:value="formState.spiltSize" :min="0" :max="100"></a-input-number>
        <a-button @click="formState.spiltSize = 80">Reset</a-button>
      </a-space>
    </a-form-item>
    <a-form-item label="随机数种子" v-if="formState.selectMethod==='按比例划分'">
      <a-input v-model:value="formState.randomNum"></a-input>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="saveForm">保存</a-button>
    </a-form-item>
  </a-form>

</template>

<script>
import * as common from "@/components/common";
import {message} from 'ant-design-vue';
import {splitFormStore} from "@/store/form";

export default {
  data() {
    return {
      label: "",
      name: "",
      formState: {
        selectMethod: "",
        spiltSize: "",
        randomNum: ""
      },
      formStore: ""
    };
  },
  props: ["node"],
  mounted() {
    // 初始化数据绑定
    common.mapper(this.node.data, this.$data);
    // 初始化表单数据
    this.formStore = splitFormStore();
    const formStateFormStore = this.formStore.getFormStateById(this.node.id);
    if (formStateFormStore) {
      this.formState = formStateFormStore;
    }
  },
  methods: {
    changeNodeName(e) {
      this.node.setData({name: e.target.value});
    },
    saveForm() {
      this.node.setData({
        formState: this.formState
      });
      this.formStore.setFormStateById(this.node.id, this.formState);
      message.success("保存成功");
    }
  }
}

</script>
