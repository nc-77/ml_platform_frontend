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
          <a-menu-item @click="runPredict" class="my-menu-item">
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
import * as res from "@/components/result";
import {nextTick} from "vue";
import {Scatter} from "@antv/g2plot";
import {RightCircleOutlined, MonitorOutlined} from "@ant-design/icons-vue";
import {predictFormStore} from "@/store/form";

export default {
  inject: ["getGraph", "getNode"],
  data() {
    return {
      showContextMenu: false,
      tableVisible: false,
      columns: [],
      dataSource: [],
      logo: "../src/assets/logo.png",
      label: "",
      name: "",
      status: "",
    };
  },
  components: {
    RightCircleOutlined,
    MonitorOutlined,
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
    async getColumns() {
      this.columns = [];
      const node = this.getNode();
      const file = common.getFileByPort(node, 2);
      await common.getFileFieldList(file?.fileId).then(columnNames => {
        columnNames?.forEach(name => {
          this.columns.push({
            title: name,
            dataIndex: name,
            key: name,
          })
        })
      })
      const formState = predictFormStore().getFormStateById(this.getNode().id);
      this.columns.push({
        title: formState.predictionResultName,
        dataIndex: formState.predictionResultName,
        key: formState.predictionResultName,
      })
    },
    async getDataSources() {
      this.dataSource = [];
      const node = this.getNode();
      const inputFile = common.getFileByPort(node, 1);
      const predictedFile = common.getFileByPort(node, 2);
      const formState = predictFormStore().getFormStateById(this.getNode().id);

      await fetch("http://localhost:8081/files/" + inputFile?.fileId + "/content", {
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
      })
      await fetch("http://localhost:8081/predictedFiles/" + predictedFile?.fileId + "/labelValues", {
        method: "GET"
      }).then(res => res.json()).then(res => {
        for (let i = 0; i < res.data?.length; i++) {
          this.dataSource[i] = {
            ...this.dataSource[i],
            [formState.predictionResultName]: res.data[i],
          }
        }
      })
    },
    async showPlot(column) {
      this.plotVisible = true;
      await nextTick();
      const data = this.dataSource;
      const scatterPlot = new Scatter('plotContainer', {
        data,
        xField: column.title,
        yField: this.columns[this.columns.length - 1].title,
        size: 5,
        pointStyle: {
          stroke: '#777777',
          lineWidth: 1,
          fill: '#5B8FF9',
        },
      });
      scatterPlot.render();
    },
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

      node.setData({
        status: "running",
      });
      // 提交表单
      const inputModel = common.getInputFileByPort(node, graph, 0);
      const inputFile = common.getInputFileByPort(node, graph, 1);
      const postData = {
        fileId: inputFile?.fileId,
        modelId: inputModel?.fileId,
      }
      const response = await fetch("http://localhost:8081/predict", {
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
        const filesMap = new Map();
        filesMap.set(node.getPortAt(0).id, inputModel);
        filesMap.set(node.getPortAt(1).id, inputFile);
        filesMap.set(node.getPortAt(2).id, resp.data);
        node.setData({
          files: filesMap,
        });
        this.getColumns();
        this.getDataSources();
      }
      result = res.getResult(resp, nodeData);
      return result;
    },
    async runPredict() {
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
      return "./src/assets/" + this.status + ".png";
    },
  },
}
</script>
