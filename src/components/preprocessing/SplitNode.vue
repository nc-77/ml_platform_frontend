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
          <a-menu-item @click="runSplit" class="my-menu-item">
            <template #icon>
              <right-circle-outlined/>
            </template>
            运行当前节点
          </a-menu-item>
          <a-menu-item @click="table1Visible=true" class="my-menu-item">
            <template #icon>
              <monitor-outlined/>
            </template>
            查看输出表1数据
          </a-menu-item>
          <a-menu-item @click="table2Visible=true" class="my-menu-item">
            <template #icon>
              <monitor-outlined/>
            </template>
            查看输出表2数据
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>

    <a-modal v-model:visible="table1Visible" title="数据结果" :footer="null" width="100%"
             wrap-class-name="full-modal">
      <a-table :dataSource="dataSource1" :columns="columns"/>
    </a-modal>

    <a-modal v-model:visible="table2Visible" title="数据结果" :footer="null" width="100%"
             wrap-class-name="full-modal">
      <a-table :dataSource="dataSource2" :columns="columns"/>
    </a-modal>

  </div>
</template>

<script>
import * as common from "@/components/common";
import * as res from "@/components/result";
import {MonitorOutlined, RightCircleOutlined} from "@ant-design/icons-vue";
import {nextTick} from "vue";
import {Scatter} from "@antv/g2plot";

export default {
  inject: ["getGraph", "getNode"],
  data() {
    return {
      showContextMenu: false,
      table1Visible: false,
      table2Visible: false,
      columns: [],
      dataSource1: [],
      dataSource2: [],
      logo: "../src/assets/logo.png",
      label: "",
      name: "",
      status: "",
    };
  },
  components: {
    MonitorOutlined,
    RightCircleOutlined,
  },
  methods: {
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
      this.dataSource1 = [];
      this.dataSource2 = [];
      const node = this.getNode();
      const outputFile1 = common.getFileByPort(node,1);
      const outputFile2 = common.getFileByPort(node,2);
      fetch("http://localhost:8081/files/" + outputFile1?.fileId + "/content", {
        method: "GET"
      }).then(res => res.json()).then(res => {
        const originData = JSON.parse(res.data);
        this.dataSource1 = originData.map((obj) => {
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
      fetch("http://localhost:8081/files/" + outputFile2?.fileId + "/content", {
        method: "GET"
      }).then(res => res.json()).then(res => {
        const originData = JSON.parse(res.data);
        this.dataSource2 = originData.map((obj) => {
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
        fileId: inputFile?.fileId,
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
        const filesMap = new Map();
        filesMap.set(node.getPortAt(0).id, inputFile);
        filesMap.set(node.getPortAt(1).id, {
          fileId: resp.data.file1Id,
          fileName: resp.data.file1Name,
        });
        filesMap.set(node.getPortAt(2).id, {
          fileId: resp.data.file2Id,
          fileName: resp.data.file2Name,
        })
        node.setData({
          files: filesMap,
        });
        this.getColumns();
        this.getDataSources();
      }
      console.log(node.getData());
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
