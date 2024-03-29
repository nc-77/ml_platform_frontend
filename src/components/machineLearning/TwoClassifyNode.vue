<template>
  <div>
    <a-dropdown :trigger="['contextmenu']" :disabled="!showContextMenu">
      <div class="node" :class="nodeClass">
        <img :src="logo"/>
        <span class="label">{{ name }}</span>
        <span class="status">
        <img :src="statusImg" v-if="statusImg"/>
      </span>
      </div>
      <template #overlay>
        <a-menu>
          <a-menu-item @click="runTwoClassify" class="my-menu-item">
            <template #icon>
              <right-circle-outlined/>
            </template>
            运行当前节点
          </a-menu-item>
          <a-menu-item @click="downloadModel" class="my-menu-item" >
            <template #icon>
              <cloud-download-outlined/>
            </template>
            模型导出
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script>
import * as common from "@/components/common";
import * as res from "@/components/result";
import {RightCircleOutlined,CloudDownloadOutlined} from "@ant-design/icons-vue";
import {message} from "ant-design-vue";

export default {
  inject: ["getGraph", "getNode"],
  data() {
    return {
      showContextMenu: false,
      logo: "../src/assets/logo.png",
      label: "",
      name: "",
      status: "",
    };
  },
  components: {
    RightCircleOutlined,
    CloudDownloadOutlined
  },
  mounted() {
    const node = this.getNode();
    // 初始化数据绑定
    common.mapper(node.data, this.$data);
    // 节点数据变化监听，从而绑定数据
    node.on("change:data", ({current}) => common.mapper(current, this.$data));
    // 绑定run方法供父组件调用
    node.setData({
      run: this.submitForm,
    })
  },
  methods: {
    async submitForm() {
      const node = this.getNode();
      const graph = this.getGraph();
      node.setData({
        status: "",
      });
      let result = {
        type: "",
        message: "",
        description: "",
      };
      const nodeData = node.getData();
      // 检查上游节点是否完成
      if (!common.checkIncomingNodes(node, graph)) {
        result = {
          type: "error",
          message: res.failedMessage(nodeData.name),
          description: res.checkIncomingFailedDesc,
        };
        return result;
      }
      // 获取上游节点data
      const incomingNodes = common.getIncomingNodes(node, graph);
      if (incomingNodes.length === 0) {
        result = {
          type: "error",
          message: res.failedMessage(nodeData.name),
          description: res.checkIncomingNodeDesc,
        };
        return result;
      }
      const inputFile = common.getInputFile(node, graph);
      node.setData({
        status: "running",
      });

      // 提交表单
      const formState = node.getData().formState;
      const postData = {
        fileId: inputFile?.fileId,
        classIndex: formState.classIndex,
        k: formState.kNumber,
      }
      const response = await fetch("http://localhost:8081/train/logistic", {
        method: "POST",
        body: JSON.stringify(postData),
        headers: {
          'Content-Type': 'application/json'
        },
      });
      // 处理上传结果并展示
      const resp = await response.json();
      const status = res.getStatus(resp.code);
      node.setData({
        status: status,
      });
      if (status === "success") {
        const files = [];
        files.push({
          ...inputFile,
          portId: node.getPortAt(0).id
        }, {
          fileId: resp.data.modelId,
          fileName: resp.data.modelName,
          portId: node.getPortAt(1).id,
        })
        node.setData({
          files: files,
        });
      }
      console.log(node.getData());
      result = res.getResult(resp, nodeData);
      return result;
    },
    downloadModel() {
      const node = this.getNode();
      const model = common.getFileByPort(node, 1);
      if(common.isEmpty(model)) {
        message.error("下载失败，节点暂无数据");
        return;
      }
      fetch("http://localhost:8081/models/download/" + model?.fileId)
          .then(response => response.blob())
          .then(blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const modelName = model?.fileName.split(".")[0];
                const newModelName = modelName + "-" + model?.fileId+ ".model";
                link.setAttribute('download', newModelName);
                document.body.appendChild(link);
                link.click();
              }
          )
    },
    async runTwoClassify() {
      const result = await this.submitForm();
      common.openNotificationWithIcon(result);
    }
  },
  computed: {
    nodeClass: function () {
      let clazz = {};
      if (this.status) clazz[this.status] = true;
      return clazz;
    },
    statusImg: function () {
      if (!this.status) {
        return "";
      }
      return "../src/assets/" + this.status + ".png";
    },
  },
}
</script>
