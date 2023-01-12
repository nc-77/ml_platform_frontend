<template>
  <a-form layout="vertical" :model="formState">
    <div class="form-label">{{ label }}</div>
    <a-form-item label="组件名称">
      <a-input v-model:value="name" @change="changeNodeName"></a-input>
    </a-form-item>
    <a-form-item label="文件路径">
      <a-upload @change="handleFormChange" :before-upload="beforeUpload"
                @remove="handleRemove">
        <a-button class="my-button">
          <upload-outlined></upload-outlined>
          点击选择
        </a-button>
      </a-upload>
    </a-form-item>
  </a-form>
</template>

<script>
import * as common from "./common";
import {UploadOutlined} from '@ant-design/icons-vue';
import eventBus from '../libs/eventBus.ts';

export default {
  data() {
    return {
      label: "",
      name: "",
      formState: {
        selectedFile: File,
      }
    };
  },
  props: ["node"],
  components: {
    UploadOutlined,
  },
  mounted() {
    // 初始化数据绑定
    common.mapper(this.node.data, this.$data);
    this.formState.selectedFile = new File([],"");
  },
  methods: {
    changeNodeName(e) {
      this.node.setData({name: e.target.value});
    },
    handleFormChange() {
      console.log("handleChange", this.formState);
      this.node.setData({formState:this.formState});
    },
    handleRemove() {
      this.formState.selectedFile = new File([],"");
    },
    beforeUpload(file) {
      this.formState.selectedFile = file;
      return false;
    },


  },
};
</script>

<style>
.ant-upload {
  width: 100%;
}

.my-button {
  font-size: 12px;
}
</style>
