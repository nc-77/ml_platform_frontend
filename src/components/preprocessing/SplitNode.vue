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
          <a-menu-item class="menu-item" key="1" @click="runSplit"
          >运行该节点
          </a-menu-item
          >
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script>
import * as common from "@/components/common";
import * as res from "@/components/result";

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
  methods: {
    async submitForm() {
      const graph = this.getGraph();
      const node = this.getNode();
      node.setData({
        status: "",
      });
      let result = {
        type: "",
        message: "",
        description: "",
      };
      let nodeData = node.getData();
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
      const incomingNode = incomingNodes.at(0);
      node.setData({
        status: "running",
        inputFileId: incomingNode.getData()?.fileId,
      });
      // 提交表单
      const formState = node.getData().formState;
      const postData = {
        fileId: incomingNode.getData()?.fileId,
        selectMethod: formState.selectMethod,
        splitSize: Number(formState.splitSize),
        randomSeed: Number(formState.randomSeed),
      }
      const response = await fetch("http://localhost:8081/files/split", {
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
        node.setData({
          outputFile1Id: resp.data.file1Id,
          outputFile1Name: resp.data.file1Name,
          outputFile2Id: resp.data.file2Id,
          outputFile2Name: resp.data.file2Name,
        })
      }
      result = res.getResult(resp, nodeData);
      return result;
    },
    async runSplit() {
      const result = await this.submitForm();
      common.openNotificationWithIcon(result);
    }
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
      return "./src/assets/" + this.status + ".png";
    },
  },
}
</script>
