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
          <a-menu-item @click="runEvalLinear" class="my-menu-item">
            <template #icon>
              <right-circle-outlined/>
            </template>
            运行当前节点
          </a-menu-item>
          <a-menu-item @click="tableVisible = true" class="my-menu-item">
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
import {MonitorOutlined, RightCircleOutlined} from "@ant-design/icons-vue";

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
    MonitorOutlined,
    RightCircleOutlined,
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
    getColumns() {
      this.columns = [{
        title: "相关系数",
        dataIndex: "correlationCoefficient",
        key: "correlationCoefficient"
      }, {
        title: "均方根误差",
        dataIndex: "meanAbsoluteError",
        key: "meanAbsoluteError"
      }, {
        title: "相对平方根误差",
        dataIndex: "rootMeanSquaredError",
        key: "rootMeanSquaredError"
      }, {
        title: "相对绝对误差",
        dataIndex: "relativeAbsoluteError",
        key: "relativeAbsoluteError"
      }, {
        title: "根相对平方误差",
        dataIndex: "rootRelativeSquaredError",
        key: "rootRelativeSquaredError"
      }, {
        title: "样本总数",
        dataIndex: "numInstances",
        key: "numInstances"
      },]
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
      const inputFile = common.getInputFile(node, graph);
      const formState = node.getData().formState;
      const postData = {
        fileId: inputFile?.fileId,
      }
      const response = await fetch("http://localhost:8081/eval/linearModel", {
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
        })
        node.setData({
          files: files,
          evalResult: resp.data,
        });
        this.getColumns();
        this.dataSource = [resp.data];
      }
      console.log(node.getData());
      result = res.getResult(resp, nodeData);
      return result;
    },

    async runEvalLinear() {
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
