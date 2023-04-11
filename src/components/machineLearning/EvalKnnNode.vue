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
          <a-menu-item @click="runEvalKnn" class="my-menu-item">
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
      <a-table :dataSource="dataSource">
        <a-table-column
            v-for="column in columns"
            :key="column.key"
            :dataIndex="column.dataIndex"
        >
          <template #title>
            <a-tooltip>
              <template #title>{{ column.description }}</template>
              {{ column.title }}
            </a-tooltip>
          </template>
        </a-table-column>
        <template #summary>
          <a-table-summary-row>
            <a-table-summary-cell>准确率</a-table-summary-cell>
            <a-table-summary-cell>
              <a-typography-text>
                {{ pctCorrect }}
              </a-typography-text>
            </a-table-summary-cell>
            <a-table-summary-cell></a-table-summary-cell>
            <a-table-summary-cell>样本总数</a-table-summary-cell>
            <a-table-summary-cell>
              <a-typography-text>
                {{ totalNumInstances }}
              </a-typography-text>
            </a-table-summary-cell>
          </a-table-summary-row>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script>
import * as common from "@/components/common";
import * as res from "@/components/result";
import {MonitorOutlined, RightCircleOutlined} from "@ant-design/icons-vue";

export default {
  inject: ["getGraph", "getNode"],
  data() {
    return {
      showContextMenu: false,
      tableVisible: false,
      columns: [],
      dataSource: [],
      pctCorrect: "",
      totalNumInstances: "",
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
        title: "类别",
        dataIndex: "labelName",
        key: "labelName",
        description:"样本类别"
      }, {
        title: "精确率",
        dataIndex: "precisionRate",
        key: "precisionRate",
        description:"预测为正例的样本中，实际为正例的样本占比",
      }, {
        title: "召回率",
        dataIndex: "recall",
        key: "recall",
        description:"实际为正例的样本中，被预测为正例的样本占比"

      }, {
        title: "F1-score",
        dataIndex: "fmeasure",
        key: "fmeasure",
        description:"精确率和召回率的调和平均数"
      }, {
        title: "类别样本总数",
        dataIndex: "numInstances",
        key: "numInstances",
        description:"该类别的样本总数"
      },]
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
      const response = await fetch("http://localhost:8081/eval/knn", {
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
        this.dataSource = resp.data?.labelEvalResults;
        this.pctCorrect = resp.data?.pctCorrect;
        this.totalNumInstances = resp.data?.totalNumInstances;
      }
      //console.log(node.getData());
      result = res.getResult(resp, nodeData);
      return result;
    },

    async runEvalKnn() {
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
