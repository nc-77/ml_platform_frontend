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
          <a-menu-item @click="runDistinct" class="my-menu-item">
            <template #icon>
              <right-circle-outlined/>
            </template>
            运行当前节点
          </a-menu-item>
          <a-menu-item @click="tableVisible=true" class="my-menu-item">
            <template #icon>
              <monitor-outlined/>
            </template>
            查看数据结果
          </a-menu-item>
          <a-menu-item @click="downloadFile(1)" class="my-menu-item">
            <template #icon>
              <cloud-download-outlined/>
            </template>
            数据结果下载
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>

    <a-modal v-model:visible="tableVisible" title="数据结果" :footer="null" width="100%"
             wrap-class-name="full-modal">
      <a-table :dataSource="dataSource" :columns="columns"/>
    </a-modal>

  </div>
</template>

<script>
import * as common from "@/components/common";
import {RightCircleOutlined, MonitorOutlined, CloudDownloadOutlined} from "@ant-design/icons-vue";
import * as res from "@/components/result";
import {message} from "ant-design-vue";

export default {
  inject: ["getGraph", "getNode"],
  data() {
    return {
      showContextMenu: false,
      columns: [],
      dataSource: [],
      tableVisible: false,
      logo: "../src/assets/logo.png",
      label: "",
      name: "",
      status: "",
    };
  },
  components: {
    RightCircleOutlined,
    MonitorOutlined,
    CloudDownloadOutlined,
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
      const inputFile = common.getInputFile(node, graph);
      node.setData({
        status: "running",
      });
      // 提交表单
      const formState = node.getData().formState;
      const postData = {
        fileId: inputFile.fileId,
        handleMethod: formState.replaceValue,
      }
      const response = await fetch("http://localhost:8081/files/handleMissingValues", {
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
          portId: node.getPortAt(0).id,
        }, {
          fileId: resp.data.fileId,
          fileName: resp.data.fileName,
          portId: node.getPortAt(1).id,
        })
        node.setData({
          files: files,
        });
        this.getColumns();
        this.getDataSources();
      }
      console.log(node.getData());
      result = res.getResult(resp, nodeData);
      return result;
    },
    async runDistinct() {
      const result = await this.submitForm();
      common.openNotificationWithIcon(result);
    },
    getColumns() {
      this.columns = [];
      const node = this.getNode();
      const file = common.getFileByPort(node, 1);
      common.getFileFieldList(file?.fileId).then(columnNames => {
        columnNames?.forEach(name => {
          this.columns.push({
            title: name,
            dataIndex: name,
            key: name,
          })
        })
      })
    },
    getDataSources() {
      this.dataSource = [];
      const node = this.getNode();
      const outputFile = common.getFileByPort(node, 1);
      fetch("http://localhost:8081/files/" + outputFile?.fileId + "/content", {
        method: "GET"
      }).then(res => res.json()).then(res => {
        const originData = JSON.parse(res.data);
        this.dataSource = originData.map((obj) => {
          const newObj = {};
          for (let [key, value] of Object.entries(obj)) {
            if (!isNaN(parseFloat(value))) {
              newObj[key] = parseFloat(value);
            } else {
              newObj[key] = value;
            }
          }
          return newObj;
        });
      });
    },
    downloadFile(portIndex) {
      const node = this.getNode();
      const outputFile = common.getFileByPort(node, portIndex);

      if (common.isEmpty(outputFile)) {
        message.error("下载失败，节点暂无数据");
        return;
      }
      fetch("http://localhost:8081/files/download/" + outputFile?.fileId)
          .then(response => response.blob())
          .then(blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', outputFile?.fileName);
                document.body.appendChild(link);
                link.click();
              }
          )
    },
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
