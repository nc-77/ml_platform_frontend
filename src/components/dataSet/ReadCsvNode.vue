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
          <a-menu-item @click="runReadCsv" class="my-menu-item">
            <template #icon>
              <right-circle-outlined/>
            </template>
            运行当前节点
          </a-menu-item>
          <a-menu-item @click="showTable" class="my-menu-item">
            <template #icon>
              <monitor-outlined/>
            </template>
            查看数据结果
          </a-menu-item>
          <a-sub-menu>
            <template #icon>
              <bar-chart-outlined/>
            </template>
            <template #title><span class="my-menu-item">数据分布可视化</span></template>
            <a-menu-item v-for="(column) in columns.slice(0,-1)" @click="showPlot(column)" class="my-menu-item">
              {{ column.title }}
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </template>
    </a-dropdown>

    <a-modal v-model:visible="tableVisible" title="数据结果" :footer="null" width="100%"
             wrap-class-name="full-modal">
      <a-table :dataSource="dataSource" :columns="columns"/>
    </a-modal>

    <a-modal v-model:visible="plotVisible" title="数据分布可视化" :footer="null" width="100%"
             wrap-class-name="full-modal" :destroy-on-close=true>
      <div id="plotContainer"></div>
    </a-modal>

  </div>
</template>

<script>
import * as common from "../common";
import * as res from "../result";
import {nextTick} from "vue";
import {Scatter} from "@antv/g2plot";
import {MonitorOutlined, BarChartOutlined, RightCircleOutlined} from "@ant-design/icons-vue";


export default {
  inject: ["getGraph", "getNode"],
  data() {
    return {
      showContextMenu: false,
      tableVisible: false,
      plotVisible: false,
      columns: [],
      dataSource: [],
      logo: "../src/assets/logo.png",
      label: "",
      name: "",
      status: "",
    };
  },
  components: {
    MonitorOutlined,
    BarChartOutlined,
    RightCircleOutlined,
  },
  methods: {
    getColumns() {
      this.columns = [];
      const node = this.getNode();
      console.log(node.getData());
      const [file] = node.getData().files.values();
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
      const [file] = node.getData().files.values();
      fetch("http://localhost:8081/files/" + file?.fileId + "/content", {
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
    },
    showTable() {
      this.tableVisible = true;
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
      node.setData({
        status: "running",
      });
      // submit Form
      let formData = new FormData();
      nodeData.formState?.fileList.forEach((file) => {
        formData.append("file", file.originFileObj);
      });
      const response = await fetch("http://localhost:8081/upload", {
        method: "POST",
        body: formData,
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
          ...resp.data,
          portId: node.getPortAt(0).id,
        })
        node.setData({
          files: files,
        });
        this.getColumns();
        this.getDataSources();
      }
      result = res.getResult(resp, nodeData);
      return result;
    },
    async runReadCsv() {
      const result = await this.submitForm();
      common.openNotificationWithIcon(result);
    },
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
      return "../src/assets/" + this.status + ".png";
    },
  },
};
</script>
<style>
.node {
  display: flex;
  align-items: center;
  width: 100%;
  height: 36px;
  background-color: #fff;
  border: 1px solid #c2c8d5;
  border-left: 4px solid #5f95ff;
  border-radius: 4px;
  box-shadow: 0 2px 5px 1px rgba(0, 0, 0, 0.06);
}

.node img {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-left: 8px;
}

.node .label {
  display: inline-block;
  flex-shrink: 0;
  width: 104px;
  margin-left: 8px;
  color: #666;
  font-size: 12px;
}

.node .status {
  flex-shrink: 0;
}

.node .success {
  border-left: 4px solid #52c41a;
}

.node .error {
  border-left: 4px solid #ff4d4f;
}

.node.running .status img {
  animation: spin 1s linear infinite;
}

.x6-node-selected .node {
  border-color: #1890ff;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #d4e8fe;
}

.x6-node-selected .node.success {
  border-color: #52c41a;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #ccecc0;
}

.x6-node-selected .node.error {
  border-color: #ff4d4f;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #fedcdc;
}

.x6-edge:hover path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1px;
}

.x6-edge-selected path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1.5px !important;
}

.menu-item {
  height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
}

@keyframes running-line {
  to {
    stroke-dashoffset: -1000;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
