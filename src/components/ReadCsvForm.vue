<template>
  <a-form :model="node" layout="vertical">
    <div class="form-label">{{ label }}</div>
    <a-form-item label="组件名称">
      <a-input v-model:value="name" @change="changeNodeName"></a-input>
    </a-form-item>
    <a-form-item label="文件路径">
      <a-upload v-model:file-list="fileList" @change="handleChange">
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

export default {
  data() {
    return {
      label: "",
      name: "",
      status: "",
      fileList: [],
    };
  },
  components: {
    UploadOutlined,
  },
  props: ["node"],
  methods: {
    changeNodeName(e) {
      this.node.setData({name: e.target.value});
    },
    handleChange() {
      console.log(this.fileList);
    }
  },
  mounted() {
    common.mapper(this.node.data, this.$data);
  },
};
</script>

<style>
.ant-upload {
  width: 100%;
}
.my-button{
  font-size: 12px;
}
</style>
