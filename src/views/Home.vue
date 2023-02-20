<template>
  <div class="container">
    <div class="nav">
      <div class="tablist">
        <a-button>
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

    <div class="content">
      <div class="sidebar">
        <div id="stencil"></div>
      </div>
      <div class="graph-param-container">
        <div id="x6-graph" style="width: 100%; height: 100%"></div>

        <div class="param-container">
          <component :is="currentForm" :node="currentNode"></component>
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
import ReadCsvNode from "@/components/dataSet/ReadCsvNode.vue";
import ReadCsvForm from "../components/dataSet/ReadCsvForm.vue";
import DistinctNode from "@/components/preprocessing/DistinctNode.vue";
import DistinctForm from "@/components/preprocessing/DistinctForm.vue";
import GetLabelNode from "@/components/preprocessing/GetLabelNode.vue";
import GetLabelForm from "@/components/preprocessing/GetLabelForm.vue";
import SplitNode from "@/components/preprocessing/SplitNode.vue";
import SplitForm from "@/components/preprocessing/SplitForm.vue";
import LinerNode from "@/components/machineLearning/LinerNode.vue";
import LinerForm from "@/components/machineLearning/LinerForm.vue";
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
} from "@ant-design/icons-vue";

const {Stencil} = Addon;
const {Edge} = Shape;

export default {
  data() {
    return {
      workName: "demo",
      graph: Graph,
      stencil: Stencil,
      currentNode: null,
      forms: new Map(),
    };
  },
  components: {
    DataSet,
    DataSetForm,
    ReadCsvNode,
    ReadCsvForm,
    DistinctNode,
    DistinctForm,
    GetLabelNode,
    GetLabelForm,
    SplitNode,
    SplitForm,
    LinerNode,
    LinerForm,
    PredictNode,
    PredictForm,

    FileDoneOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    UndoOutlined,
    RedoOutlined,
    ReloadOutlined,
    CaretRightOutlined,
  },
  mounted() {
    this.forms = new Map([
      ["读CSV文件", "ReadCsvForm"],
      ["预置数据集", "DataSetForm"],
      ["数据去重", "DistinctForm"],
      ["提取标签列", "GetLabelForm"],
      ["数据划分", "SplitForm"],
      ["线性回归", "LinerForm"],
      ["预测", "PredictForm"]
    ]);
    this.initGraph();
    this.initStencil();
    this.initKeyboardFUN();
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

    initStencil() {
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
          "get-label-node",
          {
            inherit: "vue-shape",
            component: {
              template: `
                <GetLabelNode/>`,
              components: {
                GetLabelNode,
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
      // 创建数据源组组件实例
      const readCsv = this.graph.createNode(MetaData.ReadCsv);
      const dataSet1 = this.graph.createNode(MetaData.DataSet);
      dataSet1.setData({name: "波士顿房价数据集"});
      // 创建数据预处理组件实例
      const distinct = this.graph.createNode(MetaData.Distinct);
      const splitFile = this.graph.createNode(MetaData.Split);
      const getLabel = this.graph.createNode(MetaData.GetLabel);
      // 创建机器学习组件实例
      const linerReg = this.graph.createNode(MetaData.Liner);
      const prediction = this.graph.createNode(MetaData.Predict);
      // 挂载节点实例至组件库
      stencil.load([dataSet1, readCsv], "group1");
      stencil.load([distinct, splitFile, getLabel], "group2");
      stencil.load([linerReg, prediction], "group3");

      this.stencil = stencil;
    },
  },
  computed: {
    currentForm() {
      const label = this.currentNode?.getData()?.label;
      return this.forms.get(label);
    },
  },
};
</script>

<style>
.container {
  width: 100%;
  height: 100%;
}

.nav {
  display: flex;
  height: 32px;
}

.tablist button {
  border-top: 0;
  border-bottom: 0;
}

.content {
  display: flex;
  width: 100%;
  height: calc(100% - 32px);
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

.param-container {
  width: 318px;
  border: 1px solid #d3dae5;
}
</style>
