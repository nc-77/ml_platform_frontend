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
import {nextTick} from 'vue'
import {Scatter} from '@antv/g2plot';
import {MonitorOutlined, BarChartOutlined} from "@ant-design/icons-vue";

export default {
  inject: ["getGraph", "getNode"],
  data() {
    return {
      showContextMenu: false,
      tableVisible: false,
      plotVisible: false,
      logo: "../src/assets/logo.png",
      label: "",
      name: "",
      status: "",
      columns: [],
      dataSource: [],
    };
  },
  components: {
    MonitorOutlined,
    BarChartOutlined,
  },
  methods: {
    getColumns() {
      const node = this.getNode();
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
      const node = this.getNode();
      const graph = this.getGraph();
      const [file] = node.getData().files.values();
      fetch("http://localhost:8081/files/" + file?.fileId + "/content", {
        method: "GET"
      }).then(res => res.json()).then(res => {
        const originData = JSON.parse(res.data);
        this.dataSource = originData.map((obj) => {
          const newObj = {};
          for (let [key, value] of Object.entries(obj)) {
            newObj[key] = Number(value);
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
    }
  },
  mounted() {
    const node = this.getNode();
    if (this.columns.length === 0) {
      this.getColumns();
    }
    if (this.dataSource.length === 0) {
      this.getDataSources();
    }
    // 初始化数据绑定
    common.mapper(node.data, this.$data);
    // 节点数据变化监听，从而绑定数据
    node.on("change:data", ({current}) => common.mapper(current, this.$data));
    // 绑定run方法供父组件调用
    node.setData({
      status: "success",
      run: () => {
      },
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
};
</script>

<style>

</style>

