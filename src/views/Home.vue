<template>
  <div class="container">
    <div class="page-header">
      <a-page-header
          @back="this.$router.push('/userInfo')"
      >
        <template #title>
          <div style="font-size: 14px;font-weight: 600">
            {{ this.workflow?.workflowName }}
          </div>
        </template>
      </a-page-header>
      <a-dropdown-button style="margin-right: 5px">
        {{ this.user?.username }}
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="logout">
              <LoginOutlined/>
              登出
            </a-menu-item>
          </a-menu>
        </template>
        <template #icon>
          <UserOutlined/>
        </template>
      </a-dropdown-button>
    </div>

    <div class="content">
      <div class="sidebar">
        <div id="stencil"></div>
      </div>

      <div class="graph-param-container">
        <div class="nav-graph-container">
          <div class="nav">
            <div class="tablist">
              <a-button @click="saveGraph">
                <template #icon>
                  <file-done-outlined/>
                </template>
                保存
              </a-button>
              <a-button @click="runAll">
                <template #icon>
                  <caret-right-outlined/>
                </template>
                运行
              </a-button>
              <a-button @click="this.graph.undo()">
                <template #icon>
                  <undo-outlined/>
                </template>
                撤销
              </a-button>
              <!-- <a-button @click="this.graph.redo()">
                <template #icon><redo-outlined /></template>重做
              </a-button> -->
              <a-button @click="this.graph.zoom(0.2)">
                <template #icon>
                  <zoom-in-outlined/>
                </template>
                放大
              </a-button>
              <a-button @click="this.graph.zoom(-0.2)">
                <template #icon>
                  <zoom-out-outlined/>
                </template>
                缩小
              </a-button>
              <a-button @click="this.graph.zoomTo(1)">
                <template #icon>
                  <reload-outlined/>
                </template>
                还原
              </a-button>
            </div>
          </div>
          <div id="x6-graph" style="width: 100%; height: 100%"></div>
        </div>

        <div class="param-container">
          <component :is="currentForm" :node="currentNode" :key="currentNodeId"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {Graph, Addon, Shape, Cell, Path} from "@antv/x6";
import "@antv/x6-vue-shape";
import * as MetaData from "./MetaData";
import * as common from "../components/common"

import DataSet from "@/components/dataSet/DataSet.vue";
import DataSetForm from "@/components/dataSet/DataSetForm.vue";
import ReadModelNode from "@/components/dataSet/ReadModelNode.vue";
import ReadModelForm from "@/components/dataSet/ReadModelForm.vue";
import ReadCsvNode from "@/components/dataSet/ReadCsvNode.vue";
import ReadCsvForm from "../components/dataSet/ReadCsvForm.vue";
import DistinctNode from "@/components/preprocessing/DistinctNode.vue";
import DistinctForm from "@/components/preprocessing/DistinctForm.vue";
import SplitNode from "@/components/preprocessing/SplitNode.vue";
import SplitForm from "@/components/preprocessing/SplitForm.vue";
import LinerNode from "@/components/machineLearning/LinearNode.vue";
import LinerForm from "@/components/machineLearning/LinearForm.vue";
import PredictNode from "@/components/machineLearning/PredictNode.vue";
import PredictForm from "@/components/machineLearning/PredictForm.vue";

import {
  FileDoneOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
  RedoOutlined,
  ReloadOutlined,
  CaretRightOutlined,
  LoginOutlined,
  UserOutlined
} from "@ant-design/icons-vue";
import {graphStore} from "@/store/form";
import EvalLinearForm from "@/components/machineLearning/EvalLinearForm.vue";
import EvalLinearNode from "@/components/machineLearning/EvalLinearNode.vue";
import {isEmpty} from "@/components/common";
import {message} from "ant-design-vue";
import {getStatus} from "@/components/result";

const {Stencil} = Addon;
const {Edge} = Shape;

export default {
  data() {
    return {
      workflow: {},
      user: {},
      graph: Graph,
      stencil: Stencil,
      currentNode: null,
      forms: new Map(),
    };
  },
  props: ["workflowId"],
  components: {
    EvalLinearNode,
    DataSet,
    DataSetForm,
    ReadModelNode,
    ReadModelForm,
    ReadCsvNode,
    ReadCsvForm,
    DistinctNode,
    DistinctForm,
    SplitNode,
    SplitForm,
    LinerNode,
    LinerForm,
    PredictNode,
    PredictForm,
    EvalLinearForm,

    FileDoneOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    UndoOutlined,
    RedoOutlined,
    ReloadOutlined,
    CaretRightOutlined,
    LoginOutlined,
    UserOutlined
  },
  async mounted() {
    this.forms = new Map([
      ["读CSV文件", "ReadCsvForm"],
      ["读模型文件", "ReadModelForm"],
      ["预置数据集", "DataSetForm"],
      ["数据去重", "DistinctForm"],
      ["数据划分", "SplitForm"],
      ["线性回归", "LinerForm"],
      ["预测", "PredictForm"],
      ["回归模型评估", "EvalLinearForm"]
    ]);
    await this.fetchData();
    this.initGraph();
    await this.initStencil();
    this.initKeyboardFUN();
    // load graph
    if (!isEmpty(this.workflow?.graphJson)) {
      this.graph.fromJSON(this.workflow?.graphJson);
    }
  },
  methods: {
    topoSort(nodes) {
      let sortedNodes = [];
      let queue = [];
      let incoming = new Map();
      nodes?.forEach((node) => {
        const edges = this.graph.getIncomingEdges(node);
        if (!edges || edges.length === 0) {
          queue.push(node);
          incoming[node.id] = 0;
        } else {
          incoming[node.id] = edges.length;
        }
      });
      while (queue.length > 0) {
        let top = queue.pop();
        sortedNodes.push(top);
        let outEdges = this.graph.getOutgoingEdges(top);
        outEdges?.forEach((edge) => {
          let targetId = edge.getTargetCellId();
          incoming[targetId]--;
          if (incoming[targetId] === 0) {
            queue.push(this.graph.getCellById(targetId));
          }
        });
      }
      return sortedNodes;
    },
    async fetchData() {
      this.userId = localStorage.getItem("token");
      this.workflow = await this.fetchWorkflow();
      this.user = await this.fetchUser(this.userId);
      // 路由拦截
      if (isEmpty(this.workflow) || this.workflow?.userId != this.userId) {
        message.error("访问权限错误");
        this.$router.push("/userInfo");
      }
    },
    async runAll() {
      console.log("run all");
      let nodes = this.graph.getNodes();
      if (!nodes || nodes.length === 0) {
        return;
      }
      let finalResult = {
        type: "",
        message: "",
        description: "",
      };
      let ok = true;
      const sortedNodes = this.topoSort(nodes);
      for (let node of sortedNodes) {
        const result = await node.data.run();
        if (result?.type === "error") {
          ok = false;
          common.openNotificationWithIcon(result);
          break;
        }
      }
      console.log("ok", ok);
      if (ok) {
        finalResult = {
          type: "success",
          message: "一键运行成功！",
        };
        common.openNotificationWithIcon(finalResult);
      }
    },
    initGraph() {
      const graphContainer = document.getElementById("x6-graph");
      const width =
          document.getElementsByClassName("graph-param-container").offsetWidth -
          document.getElementsByClassName("param-container").offsetWidth;
      const height = document.getElementsByClassName("sidebar");
      const graph = new Graph({
        panning: true,
        keyboard: true,
        clipboard: true,
        history: {
          enabled: true,
          ignoreChange: true,
        },
        container: graphContainer,
        width,
        height,
        background: {
          color: "#F0F4FA", // 设置画布背景颜色
        },
        connecting: {
          snap: {
            radius: 50,
          },
          allowBlank: false,
          allowMulti: "withPort",
          allowLoop: false,
          allowNode: false,
          highlight: true,
          connector: "algo-connector",
          connectionPoint: "anchor",
          anchor: "center",
          createEdge() {
            return graph.createEdge({
              shape: "dag-edge",
              attrs: {
                line: {
                  strokeDasharray: "5 5",
                },
              },
              zIndex: -1,
            });
          },
        },
        selecting: {
          enabled: true,
          multiple: true,
        },
        snapline: true,
        mousewheel: {
          enabled: true,
          modifiers: ["ctrl", "meta"],
        },
      });
      // 单击节点事件
      graph.on("node:click", ({e, x, y, node, view}) => {
        this.currentNode = node;
      });
      // 鼠标移入节点事件
      graph.on("node:mouseenter", (e) => {
        const node = e.node;
        const ports = e.node.getPorts();
        ports.forEach((port) => {
          node.setPortProp(port.id, "attrs/circle/style/visibility", "visible");
          node.setPortProp(port.id, "attrs/text/style/visibility", "visible");
        });
      });
      // 鼠标移出节点事件
      graph.on("node:mouseleave", (e) => {
        const node = e.node;
        const ports = e.node.getPorts();
        ports.forEach((port) => {
          node.setPortProp(port.id, "attrs/circle/style/visibility", "hidden");
          node.setPortProp(port.id, "attrs/text/style/visibility", "hidden");
        });
      });
      // 边成功创建事件
      graph.on("edge:connected", ({edge}) => {
        edge.attr({
          line: {
            strokeDasharray: "",
          },
        });
      });
      // 运行事件
      graph.on("node:change:data", ({node}) => {
        const edges = graph.getIncomingEdges(node);
        const {status} = node.getData();
        edges?.forEach((edge) => {
          if (status === "running") {
            edge.attr("line/strokeDasharray", 5);
            edge.attr(
                "line/style/animation",
                "running-line 30s infinite linear"
            );
          } else {
            edge.attr("line/strokeDasharray", "");
            edge.attr("line/style/animation", "");
          }
        });
      });
      this.graph = graph;
      graphStore().graph = graph;
    },

    // 键盘快捷键
    initKeyboardFUN() {
      this.graph.bindKey("ctrl+c", () => {
        const cells = this.graph.getSelectedCells();
        if (cells.length) {
          this.graph.copy(cells);
        }
        return false;
      });
      this.graph.bindKey("ctrl+v", () => {
        if (!this.graph.isClipboardEmpty()) {
          const cells = this.graph.paste(32);
          this.graph.cleanSelection();
          this.graph.select(cells);
        }
        return false;
      });
      this.graph.bindKey(
          ["Delete", "Backspace"],
          () => {
            const cells = this.graph.getSelectedCells();
            cells.forEach((e) => {
              this.graph.removeNode(e);
            });
            return false;
          },
          "keyup"
      );
      this.graph.bindKey(
          "ctrl+z",
          () => {
            this.graph.history.undo();
            return false;
          },
          "keyup"
      );
      this.graph.bindKey(
          "ctrl+y",
          () => {
            this.graph.history.redo();
            return false;
          },
          "keyup"
      );
    },

    async initStencil() {
      const stencil = new Stencil({
        title: "组件库",
        target: this.graph,
        search(cell, keyword) {
          return cell.getData().label.includes(keyword);
        },
        placeholder: "搜索",
        notFoundText: "Not Found",
        stencilGraphWidth: 170,
        stencilGraphHeight:
            document.getElementsByClassName("container") -
            document.getElementsByClassName("nav"),
        getDropNode(node) {
          // 返回一个新的节点作为实际放置到画布上的节点
          const {width, height} = node.size();
          let newNode = node.clone();
          newNode.setData({
            showContextMenu: true,
          });
          newNode.size(175, height);
          return newNode;
        },
        groups: [
          {
            name: "group1",
            title: "数据源",
            layoutOptions: {
              columns: 1,
              dx: 45,
              dy: 10,
              rowHeight: "compact",
            },
          },
          {
            name: "group2",
            title: "数据预处理",
            layoutOptions: {
              columns: 1,
              dx: 45,
              dy: 10,
              rowHeight: "compact",
            },
          },
          {
            name: "group3",
            title: "机器学习",
            layoutOptions: {
              columns: 1,
              dx: 45,
              dy: 10,
              rowHeight: "compact",
            },
          },
          {
            name: "group4",
            title: "预测及评估",
            layoutOptions: {
              columns: 1,
              dx: 45,
              dy: 10,
              rowHeight: "compact",
            },
          },
        ],
      });
      // 挂载stencil
      document.getElementById("stencil").appendChild(stencil.container);

      // 注册自定义节点
      Graph.registerNode(
          "read-csv-node",
          {
            inherit: "vue-shape",
            component: {
              template: `
                <ReadCsvNode/>`,
              components: {
                ReadCsvNode,
              },
            },
          },
          true
      );
      Graph.registerNode(
          "read-model-node",
          {
            inherit: "vue-shape",
            component: {
              template: `
                <ReadModelNode/>`,
              components: {
                ReadModelNode,
              },
            },
          },
          true
      );
      Graph.registerNode(
          "data-set",
          {
            inherit: "vue-shape",
            component: {
              template: `
                <DataSet/>`,
              components: {
                DataSet,
              },
            },
          },
          true
      );
      Graph.registerNode(
          "distinct-node",
          {
            inherit: "vue-shape",
            component: {
              template: `
                <DistinctNode/>`,
              components: {
                DistinctNode,
              },
            },
          },
          true
      );
      Graph.registerNode(
          "split-node",
          {
            inherit: "vue-shape",
            component: {
              template: `
                <SplitNode/>`,
              components: {
                SplitNode,
              },
            },
          },
          true
      );
      Graph.registerNode(
          "liner-node",
          {
            inherit: "vue-shape",
            component: {
              template: `
                <LinerNode/>`,
              components: {
                LinerNode,
              },
            },
          },
          true
      );
      Graph.registerNode(
          "predict-node",
          {
            inherit: "vue-shape",
            component: {
              template: `
                <PredictNode/>`,
              components: {
                PredictNode,
              },
            },
          },
          true
      );
      Graph.registerNode(
          "evalLinear-node",
          {
            inherit: "vue-shape",
            component: {
              template: `
                <EvalLinearNode/>`,
              components: {
                EvalLinearNode,
              },
            },
          },
          true
      );
      // 注册自定义边
      Graph.registerEdge(
          "dag-edge",
          {
            inherit: "edge",
            attrs: {
              line: {
                stroke: "#C2C8D5",
                strokeWidth: 1,
                targetMarker: null,
              },
            },
          },
          true
      );
      //注册自定义边控制器
      Graph.registerConnector(
          "algo-connector",
          (s, e) => {
            const offset = 4;
            const deltaY = Math.abs(e.y - s.y);
            const control = Math.floor((deltaY / 3) * 2);

            const v1 = {x: s.x, y: s.y + offset + control};
            const v2 = {x: e.x, y: e.y - offset - control};

            return Path.normalize(
                `M ${s.x} ${s.y}
       L ${s.x} ${s.y + offset}
       C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x} ${e.y - offset}
       L ${e.x} ${e.y}
      `
            );
          },
          true
      );

      // 创建数据预处理组件实例
      const distinct = this.graph.createNode(MetaData.Distinct);
      const splitFile = this.graph.createNode(MetaData.Split);
      // 创建机器学习组件实例
      const linerReg = this.graph.createNode(MetaData.Liner);
      const prediction = this.graph.createNode(MetaData.Predict);
      const evalLinear = this.graph.createNode(MetaData.EvalLinear);
      // 挂载节点实例至组件库
      stencil.load([distinct, splitFile], "group2");
      stencil.load([linerReg], "group3");
      stencil.load([prediction, evalLinear], "group4");
      // 加载并挂载预置数据集
      const response = await fetch("http://localhost:8081/files/dataSets", {
        method: "GET",
      });
      const resp = await response.json();
      const dataSets = resp.data;
      let dataSetNodes = [];
      dataSets?.forEach(dataSet => {
        const dataSetNode = this.graph.createNode(MetaData.DataSet);
        const files = [];
        dataSetNode.getPorts()?.forEach(port => {
          files.push({
            portId: port.id,
            fileId: dataSet.id,
            fileName: dataSet.fileName,
          })
        });
        dataSetNode.setData({
          name: dataSet.fileName.substring(0, dataSet.fileName.lastIndexOf(".")),
          files: files,
        })
        console.log(dataSetNode.getData());
        dataSetNodes.push(dataSetNode);
      });
      const readModel = this.graph.createNode(MetaData.ReadModel);
      const readCsv = this.graph.createNode(MetaData.ReadCsv);
      dataSetNodes.push(readCsv, readModel);
      stencil.load(dataSetNodes, "group1");

      this.stencil = stencil;
    },

    fetchWorkflow() {
      return fetch("http://localhost:8081/workflows/" + this.workflowId, {
        method: "GET",
      }).then(res => res.json()).then(res => res?.data);
    },
    fetchUser(id) {
      return fetch("http://localhost:8081/user/" + id, {
        method: "GET",
      }).then(res => res.json()).then(res => res?.data);
    },
    logout() {
      localStorage.clear();
      this.$router.push("/login");
    },
    async saveGraph() {
      this.workflow.graphJson = this.graph.toJSON();
      const status = await fetch("http://localhost:8081/workflow", {
        method: "POST",
        body: JSON.stringify(this.workflow),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()).then(res => getStatus(res?.code))
      status === "success" ? message.success("保存成功") : message.error("保存失败");
    }
  },
  computed: {
    currentForm() {
      const label = this.currentNode?.getData()?.label;
      return this.forms.get(label);
    },
    currentNodeId() {
      return this.currentNode ? this.currentNode.id : "";
    }
  },
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}

.page-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 46px;
}

.nav {
  display: flex;
  height: 32px;
  border-top: 1px solid #d3dae5;
}

.tablist button {
  border-top: 0;
  border-bottom: 0;
}

.content {
  display: flex;
  width: 100%;
  height: calc(100% - 46px);
}

#stencil {
  width: 164px;
  height: 100%;
  border-top: 1px solid #d3dae5;
}

#x6-graph {
  border: 1px solid #d3dae5;
}

.graph-param-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
}

.nav-graph-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.param-container {
  width: 318px;
  border: 1px solid #d3dae5;
}

</style>
