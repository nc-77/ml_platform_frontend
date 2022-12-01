<template>
  <div class="container">
    <div class="nav">
      <div class="tablist">
        <a-button>
          <template #icon><file-done-outlined /></template>保存
        </a-button>
        <a-button @click="this.graph.undo()">
          <template #icon><undo-outlined /></template>撤销
        </a-button>
        <a-button @click="this.graph.redo()">
          <template #icon><redo-outlined /></template>重做
        </a-button>
        <a-button @click="this.graph.zoom(0.2)">
          <template #icon><zoom-in-outlined /></template>放大
        </a-button>
        <a-button @click="this.graph.zoom(-0.2)">
          <template #icon><zoom-out-outlined /></template>缩小
        </a-button>
        <a-button @click="this.graph.zoomTo(1)">
          <template #icon><reload-outlined /></template>还原
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
          <param-form
            :formState="formState"
            v-show="currentNode"
            @change-node-name="changeNodeName"
          ></param-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Graph, Addon, Shape, Cell } from "@antv/x6";
import {
  FileDoneOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
  RedoOutlined,
  ReloadOutlined,
} from "@ant-design/icons-vue";
import NodeTemplate from "../components/NodeTemplate.vue";
import ParamForm from "../components/ParamForm.vue";
import * as MetaData from "./MetaData";
import "@antv/x6-vue-shape";

const { Stencil } = Addon;
const { Edge } = Shape;

export default {
  data() {
    return {
      workName: "demo",
      graph: Graph,
      stencil: Stencil,
      currentNode: null,
      formState: {},
    };
  },
  components: {
    FileDoneOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    UndoOutlined,
    RedoOutlined,
    ReloadOutlined,
    NodeTemplate,
    ParamForm,
  },
  mounted() {
    this.initGraph();
    this.initStencil();
    this.initKeyboardFUN();
  },
  methods: {
    changeNodeName(newName) {
      this.currentNode?.setData({
        name: newName,
      });
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
        selecting: true,
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
      graph.on("node:click", ({ e, x, y, node, view }) => {
        this.currentNode = node;
        this.formState = {
          label: this.currentNode?.getData()?.label,
          name: this.currentNode?.getData()?.name,
        };
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
      Graph.registerNode("img-node", {
        inherit: "vue-shape",
        component: {
          template: `<NodeTemplate/>`,
          components: {
            NodeTemplate,
          },
        },
      });
      // 创建数据源组组件实例
      const readCsv = this.graph.createNode(MetaData.ReadCSV);
      const readExcel = this.graph.createNode(MetaData.ReadExcel);

      // 创建数据预处理组件实例
      const splitFile = this.graph.createNode(MetaData.SpiltFile);
      const mergeFile = this.graph.createNode(MetaData.MergeFile);

      // 挂载节点实例至组件库
      stencil.load([readCsv, readExcel], "group1");
      stencil.load([splitFile, mergeFile], "group2");
      this.graph.addNode(readCsv.clone());
    
      this.stencil = stencil;
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
