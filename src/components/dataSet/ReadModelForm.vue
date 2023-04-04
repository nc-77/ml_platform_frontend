<template>
  <a-form layout="vertical">
    <div class="form-label">{{ label }}</div>
    <a-form-item label="组件名称">
      <a-input v-model:value="name"></a-input>
    </a-form-item>
    <a-form-item label="文件路径">
      <a-upload v-model:file-list="this.formState.fileList"
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
import * as common from "@/components/common";
import {readModelFormStore} from "@/store/form";
import {UploadOutlined} from '@ant-design/icons-vue';

export default {
  data() {
    return {
      label: "",
      name: "",
      formState: {
        fileList: [],
      },
      formStore: "",
    };
  },
  components: {
    UploadOutlined,
  },
  props: ["node"],
  mounted() {
    // 初始化数据绑定
    common.mapper(this.node.data, this.$data);
    // 初始化表单数据
    this.formStore = readModelFormStore();
    const formStateFormStore = this.formStore.getFormStateById(this.node.id);
    if (formStateFormStore) {
      this.formState = formStateFormStore;
    }
  },
  methods: {
    handleFormChange() {
      const originData = this.node.data;
      originData.formState = this.formState;
      this.node.setData(originData, {overwrite: true});
      this.formStore.setFormStateById(this.node.id, this.formState);

      const modelId = this.formState.fileList.length > 0 ? this.formState.fileList[0].name.split(".")[0].split("-").slice(-1)[0]: "";
      console.log("modelId",modelId)
      this.node.setData({
        files: [{
          fileId: Number(modelId),
          portId: this.node.getPortAt(0).id,
        }],
      })
    },
    beforeUpload(file) {
      return false;
    },
  }
}

</script>
