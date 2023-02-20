<template>
  <a-form layout="vertical" :model="formState">
    <div class="form-label">{{ label }}</div>
    <a-form-item label="组件名称">
      <a-input v-model:value="name" @change="changeNodeName"></a-input>
    </a-form-item>
    <a-form-item label="文件路径">
      <a-upload v-model:file-list="formState.fileList"
                :max-count="1"
                @change="handleFormChange"
                :before-upload="beforeUpload">
        <a-button class="my-button">
          <upload-outlined></upload-outlined>
          点击选择
        </a-button>
      </a-upload>
    </a-form-item>
  </a-form>
</template>

<script>
import * as common from "../common";
import {UploadOutlined} from '@ant-design/icons-vue';

export default {
  data() {
    return {
      label: "",
      name: "",
      formStates: new Map,
    };
  },
  props: ["node"],
  components: {
    UploadOutlined,
  },
  mounted() {
    // 初始化数据绑定
    common.mapper(this.node.data, this.$data);
  },
  methods: {
    changeNodeName(e) {
      this.node.setData({name: e.target.value});
    },
    handleFormChange() {
      const originData = this.node.data;
      originData.formState = this.formState;
      this.node.setData(originData,{overwrite:true});
    },
    beforeUpload(file) {
      return false;
    },
  },
  computed:{
    formState(){
      const key = this.node.id;
      if(!this.formStates.has(key)) {
        this.formStates.set(key,{
          fileList:[]
        });
      }
      return this.formStates.get(key);
    }
  }
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
